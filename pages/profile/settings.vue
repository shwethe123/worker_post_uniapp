<template>
  <view class="settings-container">
    <view class="settings-header">
      <text class="settings-title">Settings</text>
    </view>

    <view class="settings-list">
      <view class="settings-item" @click="navigateToEditProfile">
        <text>Edit Profile</text>
        <text>›</text>
      </view>
      <view class="settings-item" @click="navigateToChangePassword">
        <text>Change Password</text>
        <text>›</text>
      </view>
      <view class="settings-item" @click="navigateToPrivacy">
        <text>Privacy Settings</text>
        <text>›</text>
      </view>
      <view class="settings-item" @click="handleLogout">
        <text class="logout-text">Logout</text>
        <text>›</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    navigateToEditProfile() {
      uni.navigateTo({ url: '/pages/profile/edit' })
    },
    navigateToChangePassword() {
      uni.navigateTo({ url: '/pages/profile/change-password' })
    },
    navigateToPrivacy() {
      uni.navigateTo({ url: '/pages/profile/privacy' })
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
.settings-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.settings-header {
  margin-bottom: 20px;
}

.settings-title {
  font-size: 24px;
  font-weight: bold;
}

.settings-list {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.settings-item:last-child {
  border-bottom: none;
}

.logout-text {
  color: #ff4444;
}
</style>