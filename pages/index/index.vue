<template>
  <view class="container">
    <view class="new-post">
      <view class="user-avatar-wrapper">
		<image
		  v-if="post && post.avatar"
		  :src="post.avatar"
		  class="post-avatar"
		/>
        <view v-else class="user-avatar-text">
          {{ getInitials(currentUser?.username) }}
        </view>
      </view>
      <view style="width: 100%;">
        <input
          v-model="newPostContent"
          placeholder="What's on your mind?"
          @focus="showPostButton = true"
          class="post-input"
        />

        <view v-if="showPostButton" class="post-actions">
          <view class="file-upload-wrapper">
			<button class="upload-button modern" @click="chooseImage">
			  <uni-icons type="camera-filled" size="16" color="#1877f2"></uni-icons>
			  <text>Add Photo</text>
			</button>
            <image v-if="imagePreview" :src="imagePreview" class="image-preview" mode="aspectFit" />
            <button v-if="imagePreview" @click="removeImage" class="remove-image-button">
              ×
            </button>
          </view>
          <button 
            v-if="showPostButton" 
            @click="addPost"
            class="post-button"
            :disabled="!newPostContent.trim() && !imagePreview"
          >
            Post
          </button>
        </view>
      </view>
    </view>

    <view v-if="loading" class="loading">
      <text>Loading posts...</text>
    </view>

    <PostCard
      v-for="(post, index) in posts"
      :key="post._id || index"
      :post="post"
      :current-user="currentUser"
      @like-post="handleLike"
      @add-comment="handleAddComment"
      @add-reply="handleAddReply"
      @delete-post="handleDeletePost"
    />
  </view>
</template>

<script>
import PostCard from '@/pages/components/PostCard.vue'

export default {
  components: { PostCard },
  data() {
    return {
      currentUser: null,
      newPostContent: '',
      showPostButton: false,
      posts: [],
      loading: false,
      imagePreview: null,
      tempFilePath: null
    }
  },
  async onLoad() {
    const token = uni.getStorageSync('token');
    if (!token) {
      uni.redirectTo({ url: '/pages/auth/login' });
      return;
    }

    // Get stored user data
    const storedUser = uni.getStorageSync('user');
    
    if (storedUser && (storedUser.userId || storedUser.id || storedUser._id)) {
      // Normalize user data structure
      this.currentUser = {
        userId: storedUser.userId || storedUser.id || storedUser._id,
        username: storedUser.username,
        email: storedUser.email,
        avatar: storedUser.avatar || '/static/default-avatar.png'
      };
    } else {
      // If no valid user data, force logout
      uni.removeStorageSync('token');
      uni.removeStorageSync('user');
      uni.redirectTo({ url: '/pages/auth/login' });
      return;
    }

    await this.fetchPosts();
  },
  methods: {
    getInitials(username) {
      if (!username) return 'UU';
      const parts = username.split(' ');
      let initials = parts[0].charAt(0).toUpperCase();
      if (parts.length > 1) {
        initials += parts[1].charAt(0).toUpperCase();
      } else if (parts[0].length > 1) {
        initials += parts[0].charAt(1).toUpperCase();
      } else {
        initials += initials;
      }
      return initials;
    },

    async fetchPosts() {
      this.loading = true;
      try {
        const res = await uni.request({
          url: 'http://localhost:3000/api/posts',
          header: {
            'x-auth-token': uni.getStorageSync('token')
          }
        });

        this.posts = res.data || this.getMockPosts();
      } catch (error) {
        console.error('Fetch posts error:', error);
        this.posts = this.getMockPosts();
        uni.showToast({
          title: 'Using mock data',
          icon: 'none'
        });
      } finally {
        this.loading = false;
      }
    },

    getMockPosts() {
      return [
        {
          _id: 'mock-' + Date.now(),
          username: 'Demo User',
          userId: 'demo-123',
          avatar: '/static/avatar.png',
          timestamp: 'Just now',
          content: 'This is sample post',
          likes: [],
          comments: []
        }
      ];
    },

    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.tempFilePath = res.tempFilePaths[0];
          this.imagePreview = this.tempFilePath;
        },
        fail: (err) => {
          console.error('Image selection failed:', err);
          uni.showToast({
            title: 'Failed to select image',
            icon: 'none'
          });
        }
      });
    },

    removeImage() {
      this.imagePreview = null;
      this.tempFilePath = null;
    },

	async uploadImage() {
	  if (!this.tempFilePath) return null;

	  try {
		const token = uni.getStorageSync('token');
		const res = await uni.uploadFile({
		  url: 'http://localhost:3000/api/posts', // ✅ ဒီမှာ image-only POST API မရှိဘူး
		  filePath: this.tempFilePath,
		  name: 'image',
		  formData: {
			content: this.newPostContent  // ✅ content လည်း formData နဲ့ပေးရမယ်
		  },
		  header: {
			'x-auth-token': token
		  }
		});

		const data = JSON.parse(res.data);
		return data.imageUrl || null;  // ✅ response မှာ imageUrl ရှိမယ်ဆိုပြီး ပြင်ထား
	  } catch (error) {
		console.error('Image upload failed:', error);
		uni.showToast({
		  title: 'Image upload failed',
		  icon: 'none'
		});
		return null;
	  }
	},

    async addPost() {
      if (!this.newPostContent.trim() && !this.imagePreview) return;

      try {
        let imageUrl = null;
        if (this.tempFilePath) {
          imageUrl = await this.uploadImage();
        }

        const postData = {
          content: this.newPostContent
        };
        
        if (imageUrl) {
          postData.image = imageUrl;
        }

        const res = await uni.request({
          url: 'http://localhost:3000/api/posts',
          method: 'POST',
          header: {
            'x-auth-token': uni.getStorageSync('token'),
            'Content-Type': 'application/json'
          },
          data: postData
        });

        const newPost = res?.data || {
          _id: 'mock-' + Date.now(),
          username: this.currentUser?.username || 'Unknown User',
          userId: this.currentUser?.userId || 'unknown',
          avatar: this.currentUser?.avatar || '/static/default-avatar.png',
          timestamp: 'Just now',
          content: this.newPostContent,
          image: imageUrl || null,
          likes: [],
          comments: []
        };

        this.posts.unshift(newPost);
        this.newPostContent = '';
        this.showPostButton = false;
        this.imagePreview = null;
        this.tempFilePath = null;

        uni.showToast({
          title: 'Posted successfully',
          icon: 'success'
        });
      } catch (error) {
        console.error('Create post error:', error);
        uni.showToast({
          title: 'Failed to post',
          icon: 'none'
        });
      }
    },

    async handleLike(postId) {
      try {
        const post = this.posts.find(p => p._id === postId);
        if (!post) {
          console.error('Post not found:', postId);
          return;
        }

        const hasLiked = post.likes.includes(this.currentUser.userId);
        const method = hasLiked ? 'DELETE' : 'POST';
        
        const res = await uni.request({
          url: `http://localhost:3000/api/posts/${postId}/like`,
          method: 'PUT',
          header: {
            'x-auth-token': uni.getStorageSync('token'),
            'Content-Type': 'application/json'
          }
        });

        if (!res || res.statusCode !== 200) {
          throw new Error('Failed to update like');
        }

        const updatedPost = res.data;
        const index = this.posts.findIndex(p => p._id === postId);
        if (index !== -1) {
          this.posts.splice(index, 1, updatedPost);
        }

        uni.showToast({
          title: hasLiked ? 'Unliked' : 'Liked',
          icon: 'success'
        });

      } catch (error) {
        console.error('Like failed:', error);
        uni.showToast({
          title: error.message || 'Failed to update like',
          icon: 'none'
        });
      }
    },

    async handleAddComment({ postId, commentText }) {
      const post = this.posts.find(p => p._id === postId);
      if (!post) return;

      try {
        const res = await uni.request({
          url: `http://localhost:3000/api/posts/${postId}/comments`,
          method: 'POST',
          header: {
            'x-auth-token': uni.getStorageSync('token'),
            'Content-Type': 'application/json'
          },
          data: {
            text: commentText
          }
        });

        const comment = res.data || {
          _id: `comment-${Date.now()}`,
          user: this.currentUser?.username || 'Anonymous',
          userId: this.currentUser?.userId || 'unknown',
          text: commentText,
          timestamp: 'Just now',
          replies: []
        };

        post.comments.unshift(comment);
      } catch (error) {
        console.error('Add comment failed:', error);
        uni.showToast({ title: 'Failed to add comment', icon: 'none' });
      }
    },

    async handleAddReply({ postId, commentId, replyText }) {
      const post = this.posts.find(p => p._id === postId);
      if (!post) return;

      const comment = post.comments.find(c => c._id === commentId);
      if (!comment) return;

      try {
        const res = await uni.request({
          url: `http://localhost:3000/api/posts/${postId}/comments/${commentId}/replies`,
          method: 'POST',
          header: {
            'x-auth-token': uni.getStorageSync('token'),
            'Content-Type': 'application/json'
          },
          data: {
            text: replyText
          }
        });

        const newReply = res.data || {
          _id: `reply-${Date.now()}`,
          user: this.currentUser?.username || 'Anonymous',
          userId: this.currentUser?.userId || 'unknown',
          text: replyText,
          timestamp: 'Just now'
        };

        comment.replies.push(newReply);

        uni.showToast({
          title: 'Reply added',
          icon: 'success'
        });

      } catch (error) {
        console.error('Add reply failed:', error);
        uni.showToast({ title: 'Failed to add reply', icon: 'none' });
      }
    },

    handleDeletePost(postId) {
      uni.showModal({
        title: 'Delete Post',
        content: 'Are you sure?',
        success: (res) => {
          if (res.confirm) {
            this.posts = this.posts.filter(post => post._id !== postId);
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.container {
  padding: 10px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.new-post {
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: white;
  padding: 12px 15px;
  border-radius: 10px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.user-avatar-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.post-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-text {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #1877f2;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.post-input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 20px;
  background-color: #f0f2f5;
  border: none;
  font-size: 14px;
  width: 94%;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.file-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.upload-button.modern {
  background-color: transparent;
  border: 1px dashed #1877f2;
  color: #1877f2;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.upload-button.modern:active {
  background-color: rgba(24, 119, 242, 0.1);
}

.image-preview {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.remove-image-button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 0;
}

.post-button {
  background-color: #1877f2;
  color: white;
  border: none;
  padding: 0px 15px;
  border-radius: 5px;
  font-weight: 600;
  font-size: 14px;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>