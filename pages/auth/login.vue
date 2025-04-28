<template>
  <view class="login-container">
    <view class="login-form">
      <text class="title">Login</text>
      <input 
        v-model="email" 
        class="input" 
        placeholder="Email" 
        type="email" 
      />
      <input 
        v-model="password" 
        class="input" 
        placeholder="Password" 
        type="password" 
      />
      <button 
        class="login-button" 
        @click="handleLogin"
        :disabled="loading"
      >
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>
      <text class="register-link" @click="goToRegister">
        Don't have an account? Register
      </text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      currentUser: null  // Add this line
    }
  },
  
  // Removed onLoad from here - it shouldn't be in login page
  
  methods: {
    async handleLogin() {
      if (!this.email || !this.password) {
        uni.showToast({
          title: 'Please fill all fields',
          icon: 'none'
        })
        return
      }

      this.loading = true
      
      try {
        console.log('Sending login request...')
        const response = await uni.request({
          url: 'http://localhost:3000/api/users/login',
          method: 'POST',
          data: {
            email: this.email,
            password: this.password
          },
          header: {
            'Content-Type': 'application/json'
          }
        })

        console.log('Raw response:', response)

        // Handle network errors
        if (response.statusCode >= 400) {
          throw new Error(response.errMsg || 'Network error')
        }

        const responseData = response.data || response[1]?.data
        
        if (!responseData) {
          console.error('Invalid response structure:', response)
          throw new Error('Invalid server response')
        }

        if (responseData.token) {
          uni.setStorageSync('token', responseData.token);
          uni.setStorageSync('user', responseData.user);
          
          // Update local user data
          this.currentUser = responseData.user;
          
          uni.switchTab({ 
            url: '/pages/index/index'
          });
          
          uni.showToast({
            title: `Welcome back, ${responseData.user.username}!`,
            icon: 'none'
          });
          return;
        }

        throw new Error(responseData.message || 'Login failed')

      } catch (error) {
        console.error('Login error details:', error)
        uni.showToast({
          title: error.message || 'Login failed',
          icon: 'none',
          duration: 3000
        })
      } finally {
        this.loading = false
      }
    },
    
    goToRegister() {
      uni.navigateTo({ url: '/pages/auth/register' })
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 30px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  display: block;
  text-align: center;
}

.input {
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.login-button {
  width: 100%;
  padding: 12px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 10px;
}

.login-button:disabled {
  background-color: #cccccc;
}

.register-link {
  display: block;
  text-align: center;
  margin-top: 15px;
  color: #007aff;
  text-decoration: underline;
}
</style>