<template>
  <view class="profile-container">
    <!-- Profile Header -->
    <view class="profile-header">
      <view class="avatar-container">
        <view class="avatar-large">
          {{ getInitials(currentUser.username) }}
        </view>
      </view>
      <text class="username">{{ currentUser.username }}</text>
      <text class="email">{{ currentUser.email }}</text>
    </view>

    <!-- Profile Stats -->
    <view class="profile-stats">
      <view class="stat-item">
        <text class="stat-number">{{ postsCount }}</text>
        <text class="stat-label">Posts</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ followersCount }}</text>
        <text class="stat-label">Followers</text>
      </view>
      <view class="stat-item">
        <text class="stat-number">{{ followingCount }}</text>
        <text class="stat-label">Following</text>
      </view>
    </view>




    <!-- Settings and Logout -->
    <view class="profile-actions">
      <button class="action-button" @click="navigateToSettings">
        Settings
      </button>
      <button class="action-button logout" @click="handleLogout">
        Logout
      </button>
    </view>
  </view>
</template>

<script>

export default {
  data() {
    return {
      currentUser: {},
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
      userPosts: [],
      loading: false
    }
  },
  async onLoad() {
    await this.loadProfileData()
  },
  methods: {
    async loadProfileData() {
      this.loading = true
      try {
        // Get current user from storage
        const user = uni.getStorageSync('user')
        if (!user) {
          uni.redirectTo({ url: '/pages/auth/login' })
          return
        }
        this.currentUser = user

        // Fetch user stats
        // const statsRes = await uni.request({
        //   url: `http://192.168.16.32:3000/api/users/${user.userId}/stats`,
        //   header: {
        //     'x-auth-token': uni.getStorageSync('token')
        //   }
        // })
        
        // if (statsRes.data) {
        //   this.postsCount = statsRes.data.postsCount || 0
        //   this.followersCount = statsRes.data.followersCount || 0
        //   this.followingCount = statsRes.data.followingCount || 0
        // }

        // // Fetch user posts
        // const postsRes = await uni.request({
        //   url: `http://192.168.16.32:3000/api/users/${user.userId}/posts`,
        //   header: {
        //     'x-auth-token': uni.getStorageSync('token')
        //   }
        // })
        
        // this.userPosts = postsRes.data || []
      } catch (error) {
        console.error('Profile load error:', error)
        uni.showToast({
          title: 'Failed to load profile',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    getInitials(username) {
      if (!username) return 'UU'
      const parts = username.split(' ')
      let initials = parts[0].charAt(0).toUpperCase()
      if (parts.length > 1) {
        initials += parts[1].charAt(0).toUpperCase()
      }
      return initials
    },
    handleLike(postId) {
      // Implement like functionality similar to your main page
    },
    handleDeletePost(postId) {
      this.userPosts = this.userPosts.filter(post => post._id !== postId)
      this.postsCount--
    },
    navigateToSettings() {
      uni.navigateTo({ url: '/pages/profile/settings' })
    },
    handleLogout() {
      uni.showModal({
        title: 'Logout',
        content: 'Are you sure you want to logout?',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token')
            uni.removeStorageSync('user')
            uni.reLaunch({ url: '/pages/auth/login' })
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.profile-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.avatar-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #1877f2;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 10px;
}

.username {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.email {
  font-size: 16px;
  color: #666;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  margin: 20px 0;
  padding: 15px 0;
  background-color: white;
  border-radius: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 15px 0;
  display: block;
}

.user-posts {
  margin-bottom: 20px;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-button {
	width: 100%;
    padding: 12px;
    border-radius: 5px;
    border: none;
    font-size: 16px;
    background-color: #1877f2;
    color: white;
}

.action-button.logout {
  background-color: #ff4444;
}
</style>