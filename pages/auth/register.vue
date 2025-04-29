<template>
  <view class="register-container">
    <view class="register-form">
      <text class="title">Register</text>
      <input v-model="username" placeholder="Username" class="input" />
      <input v-model="email" placeholder="Email" type="email" class="input" />
      <input v-model="password" placeholder="Password" type="password" class="input" />
      <button class="register-button" @click="handleRegister">
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
      <text class="login-link" @click="goToLogin">
        Already have an account? Login
      </text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      email: '',
      password: '',
      loading: false
    }
  },
  methods: {
    async handleRegister() {
      if (!this.username || !this.email || !this.password) {
        uni.showToast({
          title: 'Please fill all fields',
          icon: 'none'
        })
        return
      }

      this.loading = true
      
      try {
        const response = await uni.request({
          url: 'http://192.168.16.32:3000/api/users/register',
          method: 'POST',
          data: {
            username: this.username,
            email: this.email,
            password: this.password
          }
        })

        uni.showToast({
          title: 'Registration successful!',
          icon: 'success'
        })
        this.goToLogin()
      } catch (error) {
        console.error('Registration error:', error)
        uni.showToast({
          title: 'Registration failed',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    goToLogin() {
      uni.navigateTo({ url: '/pages/auth/login' })
    }
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
}

.register-form {
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

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 10px;
}

.register-button:disabled {
  background-color: #cccccc;
}

.login-link {
  display: block;
  text-align: center;
  margin-top: 15px;
  color: #007aff;
  text-decoration: underline;
}
</style>