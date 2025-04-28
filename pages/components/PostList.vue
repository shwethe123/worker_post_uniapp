<!-- <template>
  <view>
    <view class="new-post">
      <input v-model="newPostContent" placeholder="What's on your mind?" />
      <button @click="addPost">Post</button>
    </view>

    <PostCard
      v-for="(post, index) in posts"
      :key="index"
      :post="post"
      :user="currentUser"
    />
  </view>
</template>

<script>
import PostCard from './PostCard.vue'

export default {
  components: { PostCard },
  data() {
    return {
      currentUser: {
        username: 'You',
        avatar: '/static/avatar-you.png'
      },
      newPostContent: '',
      posts: [
        {
          username: 'Alice',
          avatar: '/static/avatar.png',
          timestamp: 'Just now',
          content: 'Today is a beautiful day 🌤️',
          comments: [
            {
              user: 'Bob',
              text: 'Indeed it is!',
              replies: [
                { user: 'Alice', text: 'Glad you think so! 😊' }
              ]
            }
          ]
        }
      ]
    }
  },
  methods: {
    addPost() {
      if (this.newPostContent.trim()) {
        this.posts.unshift({
          username: this.currentUser.username,
          avatar: this.currentUser.avatar,
          timestamp: 'Just now',
          content: this.newPostContent,
          comments: []
        })
        this.newPostContent = ''
      }
    }
  }
}
</script>

<style scoped>
.new-post {
  display: flex;
  gap: 10px;
  margin: 16px;
}
.new-post input {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #ccc;
}
.new-post button {
  background-color: #007aff;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
}
</style -->>
