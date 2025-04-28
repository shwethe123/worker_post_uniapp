<template>
  <view class="container">
    <view class="new-post">
		<view class="user-avatar-wrapper">
		  <image 
			v-if="currentUser?.avatar && currentUser.avatar !== '/static/default-avatar.png'"
			class="user-avatar" 
			:src="currentUser.avatar"
			mode="aspectFill"
		  />
		  <view 
			v-else 
			class="user-avatar-text"
		  >
			{{ currentUser?.username?.charAt(0).toUpperCase() || 'U' }}
		  </view>
		</view>
      <input 
        v-model="newPostContent" 
        placeholder="What's on your mind?" 
        @focus="showPostButton = true"
      />
      <button 
        v-if="showPostButton" 
        @click="addPost"
        class="post-button"
        :disabled="!newPostContent.trim()"
      >
        Post
      </button>
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
      loading: false
    }
  },
	async onLoad() {
	  const token = uni.getStorageSync('token');
	  if (!token) {
		uni.redirectTo({ url: '/pages/auth/login' });
		return;
	  }

	  // Load user data more carefully
	  const storedUser = uni.getStorageSync('user');
	  if (storedUser && storedUser.userId) {
		this.currentUser = storedUser;
	  } else {
		this.currentUser = {
		  username: 'Guest',
		  avatar: '/static/default-avatar.png',
		  userId: 'guest-' + Math.random().toString(36).substring(2, 9)
		};
		// Save the generated user to storage
		uni.setStorageSync('user', this.currentUser);
	  }

	  await this.fetchPosts();
	},
  methods: {
    async fetchPosts() {
      this.loading = true
      try {
        const res = await uni.request({
          url: 'http://localhost:3000/api/posts',
          header: {
            'x-auth-token': uni.getStorageSync('token')
          }
        })

        this.posts = res.data || this.getMockPosts()
      } catch (error) {
        console.error('Fetch posts error:', error)
        this.posts = this.getMockPosts()
        uni.showToast({
          title: 'Using mock data',
          icon: 'none'
        })
      } finally {
        this.loading = false
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
      ]
    },

    async addPost() {
      if (!this.newPostContent.trim()) return

      try {
        const res = await uni.request({
          url: 'http://localhost:3000/api/posts',
          method: 'POST',
          header: {
            'x-auth-token': uni.getStorageSync('token'),
            'Content-Type': 'application/json'
          },
          data: {
            content: this.newPostContent
          }
        })

        const newPost = res?.data || {
          _id: 'mock-' + Date.now(),
          username: this.currentUser?.username || 'Unknown User',
          userId: this.currentUser?.userId || 'unknown',
          avatar: this.currentUser?.avatar || '/static/default-avatar.png',
          timestamp: 'Just now',
          content: this.newPostContent,
          likes: [],
          comments: []
        }

        this.posts.unshift(newPost)
        this.newPostContent = ''
        this.showPostButton = false

        uni.showToast({
          title: 'Posted successfully',
          icon: 'success'
        })
      } catch (error) {
        console.error('Create post error:', error)
        uni.showToast({
          title: 'Failed to post',
          icon: 'none'
        })
      }
    },

    // ✅ Updated like with API
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

		const updatedPost = res.data;  // ✅ ပြောင်းပြီးပဲထုတ်ယူ
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


    // ✅ Updated comment with API
    async handleAddComment({ postId, commentText }) {
      const post = this.posts.find(p => p._id === postId)
      if (!post) return

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
        })

        const comment = res.data || {
          _id: `comment-${Date.now()}`,
          user: this.currentUser?.username || 'Anonymous',
          userId: this.currentUser?.userId || 'unknown',
          text: commentText,
          timestamp: 'Just now',
          replies: []
        }

        post.comments.unshift(comment)
      } catch (error) {
        console.error('Add comment failed:', error)
        uni.showToast({ title: 'Failed to add comment', icon: 'none' })
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
            this.posts = this.posts.filter(post => post._id !== postId)
          }
        }
      })
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

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.new-post input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 20px;
  background-color: #f0f2f5;
  border: none;
  font-size: 14px;
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

.user-avatar-wrapper {
  width: 40px;
  height: 40px;
  position: relative;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #ccc;
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
  font-size: 18px;
}

</style>
