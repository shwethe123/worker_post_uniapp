<template>
  <view :class="['workspace', isDark ? 'dark' : '']">
    <!-- User Info -->
    <view class="user-info" v-if="user.name && user.avatar">
      <image class="avatar" :src="user.avatar" />
      <text class="greeting">{{ t('welcome') }}, {{ user.name }}</text>
    </view>

    <!-- Header -->
    <view class="header">
      <text class="title">{{ t('workspace') }}</text>
    </view>

    <!-- Language & Theme Toggles -->
    <view class="toggles">
      <button size="mini" @click="toggleLang">
        {{ lang === 'en' ? 'မြန်မာ' : 'English' }}
      </button>
      <switch @change="toggleDark" :checked="isDark" />
    </view>

    <!-- Search Bar -->
    <input
      class="search-input"
      v-model="searchQuery"
      :placeholder="t('search')"
    />

    <!-- Tool Grid -->
    <view class="grid">
      <view
        class="card"
        v-for="item in filteredTools"
        :key="item.title"
        @click="goTo(item.path)"
      >
        <view @click="work_leave" class="card-icon-wrap">
          <uni-icons :type="item.icon" size="40" color="#4CAF50" />
          <view class="badge" v-if="item.unreadCount > 0">
            {{ item.unreadCount }}
          </view>
        </view>
        <text class="card-title">{{ item.title }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'

export default {
  components: { uniIcons },
  data() {
    return {
      lang: 'en',
      isDark: false,
      searchQuery: '',
      user: {
        name: '',
        avatar: '',
      },
      tools: [
        {
          title: 'Projects',
          path: '/pages/projects/index',
          icon: 'folder',
          unreadCount: 0,
        },
        {
          title: 'Tasks',
          path: '/pages/tasks/index',
          icon: 'list',
          unreadCount: 3,
        },
        {
          title: 'Team',
          path: '/pages/team/index',
          icon: 'person',
          unreadCount: 0,
        },
        {
          title: 'Calendar',
          path: '/pages/calendar/index',
          icon: 'calendar',
          unreadCount: 2,
        },
      ],
      translations: {
        en: {
          welcome: 'Welcome',
          workspace: 'My Workspace',
          search: 'Search tools...',
        },
        mm: {
          welcome: 'ကြိုဆိုပါတယ်',
          workspace: 'ကျွန်ုပ်၏အလုပ်ခန်းမ',
          search: 'ကိရိယာများကိုရှာဖွေပါ...',
        },
      },
    }
  },
  computed: {
    filteredTools() {
      return this.tools.filter((tool) =>
        tool.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },
  },
  onLoad() {
    this.fetchUserData()
  },
  methods: {
    t(key) {
      return this.translations[this.lang][key] || key
    },
    toggleLang() {
      this.lang = this.lang === 'en' ? 'mm' : 'en'
    },
    toggleDark(e) {
      this.isDark = e.detail.value
    },
    goTo(path) {
      uni.navigateTo({ url: '/pages/components/worker_request/work_leave' })
    },
    async fetchUserData() {
      try {
        const token = uni.getStorageSync('token')
        if (!token) {
          uni.showToast({ title: 'Please login', icon: 'none' })
          return
        }

        const res = await uni.request({
          url: 'http://192.168.16.32:3000/api/posts',
          method: 'GET',
          header: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.statusCode === 200 && res.data.length > 0) {
          this.user.name = res.data[0].name
          this.user.avatar = res.data[0].avatar
        } else {
          console.error('User data not found or unauthorized')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    },
  },
}
</script>
<style scoped>
.workspace {
  padding: 20rpx;
  background-color: #ffffff;
  min-height: 100vh;
  color: #000000;
}

.workspace.dark {
  background-color: #1e1e1e;
  color: #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.greeting {
  font-size: 32rpx;
}

.header {
  padding: 20rpx 0;
  text-align: center;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
}

.toggles {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.search-input {
  padding: 20rpx;
  border: 1rpx solid #ccc;
  border-radius: 10rpx;
  font-size: 28rpx;
  margin-bottom: 20rpx;
  background-color: #ffffff;
}

.workspace.dark .search-input {
  background-color: #333333;
  color: white;
  border-color: #555;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.card {
  width: 48%;
  background-color: #f5f5f5;
  margin-bottom: 20rpx;
  padding: 30rpx 0;
  border-radius: 20rpx;
  text-align: center;
  box-shadow: 0 5rpx 10rpx rgba(0, 0, 0, 0.05);
  position: relative;
  transition: transform 0.2s;
}

.workspace.dark .card {
  background-color: #2c2c2c;
}

.card:active {
  transform: scale(0.96);
}

.card-icon-wrap {
  position: relative;
}

.card-icon {
  font-size: 80rpx;  /* Set size of the icon */
  color: #4CAF50; /* Set the icon color */
}

.badge {
  position: absolute;
  top: -5rpx;
  right: -5rpx;
  background: red;
  color: white;
  border-radius: 20rpx;
  padding: 4rpx 10rpx;
  font-size: 20rpx;
}

.card-title {
  font-size: 28rpx;
}
</style>
