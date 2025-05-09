<template>
  <view class="login-container">
    <view class="login-card">
      <text class="title">Welcome Back</text>
      <text class="subtitle">Please login to continue</text>

      <input 
        v-model="email" 
        class="input" 
        placeholder="Enter your email" 
        type="email" 
      />
      <input 
        v-model="password" 
        class="input" 
        placeholder="Enter your password" 
        type="password" 
      />

      <button 
        class="login-button" 
        @click="handleLogin"
        :disabled="loading"
      >
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>

      <view class="footer">
        <text>Don't have an account?</text>
        <text class="register-link" @click="goToRegister"> Register</text>
      </view>
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
          url: 'https://worker-post-backend.onrender.com/api/users/login',
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
		  // Debug here
		  console.log("Login user data:", responseData.user)
		
		  // Ensure userId exists before storing
		  if (!responseData.user.userId) {
		    responseData.user.userId = responseData.user.id || responseData.user._id;
		  }
		
		  uni.setStorageSync('token', responseData.token);
		  uni.setStorageSync('user', responseData.user);
		
		  this.currentUser = responseData.user;
		  
		  uni.switchTab({ url: '/pages/index/index' });
		
		  uni.showToast({
		    title: `Welcome back, ${responseData.user.username}!`,
		    icon: 'none'
		  });
		  return;
		}

        // if (responseData.token) {
        //   uni.setStorageSync('token', responseData.token);
        //   uni.setStorageSync('user', responseData.user);
          
        //   // Update local user data
        //   this.currentUser = responseData.user;
          
        //   uni.switchTab({ 
        //     url: '/pages/index/index'
        //   });
          
        //   uni.showToast({
        //     title: `Welcome back, ${responseData.user.username}!`,
        //     icon: 'none'
        //   });
        //   return;
        // }

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
  /* background: linear-gradient(to right, #6a11cb, #2575fc); */
}

.login-card {
  width: 100%;
  max-width: 380px;
  background-color: white;
  padding: 35px 25px;
  border-radius: 16px;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.4s ease-in-out;
}

.title {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 25px;
}
.input {
  width: 90%;
  padding: 14px 16px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.input:focus {
  border-color: #2575fc;
}

.login-button {
  width: 100%;
  padding: 14px;
  background-color: #2575fc;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 10px;
  transition: background-color 0.3s;
}

.login-button:disabled {
  background-color: #aaa;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
  font-size: 14px;
  color: #555;
}

.register-link {
  margin-left: 5px;
  color: #2575fc;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>