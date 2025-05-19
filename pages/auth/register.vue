<template>
  <view class="register-container">
    <view class="register-card">
      <text class="title">Create Account</text>
      <view class="">
      	<text class="subtitle">Join us today - it’s free!</text>
      </view>

      <input v-model="username" placeholder="Username" class="input" />
      <input v-model="email" placeholder="Email" type="email" class="input" />
      <input v-model="password" placeholder="Password" type="password" class="input" />

      <button class="register-button" @click="handleRegister" :disabled="loading">
        {{ loading ? 'Registering...' : 'Register' }}
      </button>

      <view class="footer">
        <text>Already have an account?</text>
        <text class="login-link" @click="goToLogin"> Login</text>
      </view>
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
  /* background: linear-gradient(to right, #43cea2, #185a9d); */
}

.register-card {
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  padding: 35px 25px;
  border-radius: 16px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
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
  border-color: #43cea2;
}

.register-button {
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

.register-button:disabled {
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

.login-link {
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