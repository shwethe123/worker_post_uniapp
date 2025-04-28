// Create api.js in utils folder
const BASE_URL = 'http://localhost:3000/api'

export default {
  async request(options) {
    const token = uni.getStorageSync('token')
    const [err, res] = await uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'x-auth-token': token,
        ...options.headers
      }
    })
    
    if (err) throw err
    return res.data
  },
  
  async getPosts() {
    return this.request({ url: '/posts' })
  },
  
  async createPost(content) {
    return this.request({
      url: '/posts',
      method: 'POST',
      data: { content }
    })
  }
}