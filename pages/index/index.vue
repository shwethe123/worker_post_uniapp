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
              <!-- <uni-icons type="camera-filled" size="16" color="#1877f2" /> -->
              <text>Add Photo</text>
            </button>
            <image
              v-if="imagePreview"
              :src="imagePreview"
              class="image-preview"
              mode="aspectFit"
            />
            <button v-if="imagePreview" @click="removeImage" class="remove-image-button">
              ×
            </button>
          </view>
          <button
            class="post-button"
            @click="addPost"
            :disabled="!newPostContent.trim() && !imagePreview"
          >
            Post
          </button>
        </view>
      </view>
    </view>

    <scroll-view
      scroll-y
      class="post-list"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="loadMorePosts"
    >
      <view class="refresh-indicator" v-if="isRefreshing">
        <text>Loading...</text>
      </view>

      <view v-if="loading && visiblePosts.length === 0" class="loading">
        <text>Loading posts...</text>
      </view>

      <view v-else-if="visiblePosts.length === 0" class="no-posts">
        <text>No posts yet. Be the first to post!</text>
      </view>

      <PostCard
        v-for="(post, index) in visiblePosts"
        :key="post._id || index"
        :post="post"
        :current-user="currentUser"
        @like-post="handleLike"
        @add-comment="handleAddComment"
        @add-reply="handleAddReply"
        @delete-post="handleDeletePost"
      />

      <view v-if="hasMorePosts" class="load-more-hint">
        <text>Pull up to load more posts</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import PostCard from '@/pages/components/PostCard.vue';
// import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';


export default {
  components: { PostCard },
  data() {
    return {
      currentUser: null,
      newPostContent: '',
      showPostButton: false,
      posts: [],
      visiblePosts: [],
      loading: false,
      imagePreview: null,
      tempFilePath: null,
      isRefreshing: false,
      postsPerPage: 8,
      currentPage: 1,
      hasMorePosts: false
    };
  },
  async onLoad() {
    const token = uni.getStorageSync('token');
    if (!token) {
      uni.redirectTo({ url: '/pages/auth/login' });
      return;
    }

    const storedUser = uni.getStorageSync('user');
    if (storedUser && (storedUser.userId || storedUser.id || storedUser._id)) {
      this.currentUser = {
        userId: storedUser.userId || storedUser.id || storedUser._id,
        username: storedUser.username,
        email: storedUser.email,
        avatar: storedUser.avatar || '/static/default-avatar.png'
      };
    } else {
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
          url: 'http://192.168.16.32:3000/api/posts',
          header: {
            'x-auth-token': uni.getStorageSync('token')
          }
        });

        this.posts = res.data || this.getMockPosts();
        this.updateVisiblePosts();
      } catch (error) {
        console.error('Fetch posts error:', error);
        this.posts = this.getMockPosts();
        this.updateVisiblePosts();
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
          content: 'This is a sample post',
          likes: [],
          comments: []
        }
      ];
    },

    updateVisiblePosts() {
      const endIndex = this.currentPage * this.postsPerPage;
      this.visiblePosts = this.posts.slice(0, endIndex);
      this.hasMorePosts = endIndex < this.posts.length;
    },

    onRefresh() {
      this.isRefreshing = true;
      setTimeout(() => {
        this.currentPage = 1;
        this.fetchPosts().finally(() => {
          this.isRefreshing = false;
        });
      }, 1000);
    },

    loadMorePosts() {
      if (!this.hasMorePosts || this.isRefreshing) return;
      this.currentPage++;
      this.updateVisiblePosts();
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

    async uploadImageAndPost() {
      const token = uni.getStorageSync('token');
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: 'http://192.168.16.32:3000/api/posts',
          filePath: this.tempFilePath,
          name: 'image',
          formData: {
            content: this.newPostContent
          },
          header: {
            'x-auth-token': token
          },
          success: (uploadRes) => {
            try {
              const data = JSON.parse(uploadRes.data);
              resolve(data);
            } catch (e) {
              reject(new Error('Invalid response from server'));
            }
          },
          fail: (err) => {
            console.error('Upload failed:', err);
            reject(err);
          }
        });
      });
    },

    async addPost() {
      if (!this.newPostContent.trim() && !this.tempFilePath) return;

      let newPost = null;
      try {
        if (this.tempFilePath) {
          newPost = await this.uploadImageAndPost();
        } else {
          const res = await uni.request({
            url: 'http://192.168.16.32:3000/api/posts',
            method: 'POST',
            header: {
              'x-auth-token': uni.getStorageSync('token'),
              'Content-Type': 'application/json'
            },
            data: {
              content: this.newPostContent
            }
          });
          newPost = res.data;
        }

        this.posts.unshift(newPost);
        this.newPostContent = '';
        this.showPostButton = false;
        this.imagePreview = null;
        this.tempFilePath = null;

        this.currentPage = 1;
        this.updateVisiblePosts();

        uni.showToast({
          title: 'Posted successfully',
          icon: 'success'
        });
      } catch (error) {
        console.error('Post failed:', error);
        uni.showToast({
          title: 'Failed to post',
          icon: 'none'
        });
      }
    },

    async handleLike(postId) {
      try {
        const post = this.posts.find(p => p._id === postId);
        if (!post) return;

        const res = await uni.request({
          url: `http://192.168.16.32:3000/api/posts/${postId}/like`,
          method: 'PUT',
          header: {
            'x-auth-token': uni.getStorageSync('token')
          }
        });

        if (res.statusCode === 200) {
          const updatedPost = res.data;
          const index = this.posts.findIndex(p => p._id === postId);
          if (index !== -1) {
            this.posts.splice(index, 1, updatedPost);
          }
        } else {
          throw new Error('Failed to update like');
        }
      } catch (error) {
        console.error('Like error:', error);
        uni.showToast({
          title: 'Like failed',
          icon: 'none'
        });
      }
    },

    async handleAddComment({ postId, commentText }) {
      const post = this.posts.find(p => p._id === postId);
      if (!post) return;

      try {
        const res = await uni.request({
          url: `http://192.168.16.32:3000/api/posts/${postId}/comments`,
          method: 'POST',
          header: {
            'x-auth-token': uni.getStorageSync('token'),
            'Content-Type': 'application/json'
          },
          data: { text: commentText }
        });

        post.comments.unshift(res.data);
      } catch (error) {
        console.error('Comment failed:', error);
        uni.showToast({
          title: 'Failed to add comment',
          icon: 'none'
        });
      }
    },

    async handleAddReply({ postId, commentId, replyText }) {
      const post = this.posts.find(p => p._id === postId);
      if (!post) return;
      const comment = post.comments.find(c => c._id === commentId);
      if (!comment) return;

      try {
        const res = await uni.request({
          url: `http://192.168.16.32:3000/api/posts/${postId}/comments/${commentId}/replies`,
          method: 'POST',
          header: {
            'x-auth-token': uni.getStorageSync('token'),
            'Content-Type': 'application/json'
          },
          data: { text: replyText }
        });

        comment.replies.push(res.data);
      } catch (error) {
        console.error('Reply error:', error);
        uni.showToast({
          title: 'Failed to reply',
          icon: 'none'
        });
      }
    },

    handleDeletePost(postId) {
      uni.showModal({
        title: 'Delete Post',
        content: 'Are you sure you want to delete this post?',
        success: (res) => {
          if (res.confirm) {
            this.posts = this.posts.filter(p => p._id !== postId);
            this.updateVisiblePosts();
          }
        }
      });
    }
  }
};
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

.post-list {
  /* height: calc(100vh - 120px); */
  height: 100vh;
  padding-bottom: 20px;
}

.refresh-indicator {
  text-align: center;
  padding: 10px;
  color: #666;
  font-size: 14px;
}

.load-more-hint {
  text-align: center;
  padding: 15px;
  color: #666;
  font-size: 14px;
  font-style: italic;
}

.no-posts {
  text-align: center;
  padding: 40px 20px;
  color: #666;
  font-size: 16px;
}
</style>