<template>
  <view class="card">
    <!-- Header -->
    <view class="card-header">
      <view class="user-avatar-wrapper">
        <image
          v-if="post && post.avatar"
          :src="post.avatar"
          class="post-avatar"
        />
        <view
          v-else
          class="user-avatar-text"
          :style="{ backgroundColor: getAvatarColor(post.userId === currentUser.userId 
            ? currentUser.username 
            : post.user.username) }"
        >
          {{
            getInitials(post.userId === currentUser.userId 
              ? currentUser.username 
              : post.user.username)
          }}
        </view>
      </view>

      <view class="user-info">
        <text class="username">{{ post.user.username }}</text>
        <text class="timestamp">{{ formatRelativeTime(post.createdAt) }}</text>
      </view>

      <view v-if="post.userId === currentUser.userId" class="post-actions">
        <text @click="deletePost" class="delete-btn">X</text>
      </view>
      <view class="post-actions">
        <text @click="todoPost" class="todo-btn">Todo</text>
      </view>
    </view>

    <!-- Content -->
    <view class="card-body">
      <text class="content">{{ post.content }}</text>
      <image
        v-if="post.image"
        :src="post.image"
        class="post-image"
        mode="widthFix"
        @tap="previewImage"
      />
    </view>

    <!-- Stats -->
    <view class="card-stats">
      <text class="likes-count">{{ post.likes.length }} likes</text>
      <text @click="toggleComments" class="comments-count">{{ post.comments.length }} comments</text>
    </view>

    <!-- Actions -->
    <view class="card-actions">
      <text @click="toggleLike" class="action-btn" :class="{ liked: isLiked }">
        <text :style="{ color: isLiked ? '#e0245e' : '#65676b' }">
          {{ isLiked ? '❤️' : '♡' }}
        </text> {{ isLiked ? 'Liked' : 'Like' }}
      </text>
      <text @click="toggleComments" class="action-btn">
        <text>💬</text> Comment
      </text>
    </view>

    <!-- Comments -->
    <view v-if="commentsVisible" class="comment-section">
      <view v-for="comment in post.comments" :key="comment._id" class="comment-item">
        <view class="comment-avatar-text" :style="{ backgroundColor: getAvatarColor(comment.user.username) }">
          {{ getInitials(comment.user.username) }}
        </view>

        <view class="comment-content">
          <view class="comment-text">
            <view class="comment-header">
              <text class="comment-user">{{ comment.user.username }}</text>
              <text class="timestamp">{{ formatRelativeTime(comment.createdAt) }}</text>
            </view>
            <text>{{ comment.text }}</text>
          </view>

          <view v-if="comment.replies.length" class="replies-container">
            <view v-for="reply in comment.replies" :key="reply._id" class="reply-item">
              <view class="reply-avatar-text" :style="{ backgroundColor: getAvatarColor(reply.user.username) }">
                {{ getInitials(reply.user.username) }}
              </view>

              <view class="reply-content">
                <view class="reply-header">
                  <text class="reply-user">{{ reply.user.username }}</text>
                  <text class="timestamp">{{ formatRelativeTime(reply.createdAt) }}</text>
                </view>
                <text class="reply-text">{{ reply.text }}</text>
              </view>
            </view>
          </view>

          <view class="reply_con">
            <text @click="showReplyInput(comment._id)" class="reply-btn">Reply</text>
          </view>

          <view v-if="activeReplyInput === comment._id" class="reply-input">
            <view class="comment-avatar-text" :style="{ backgroundColor: getAvatarColor(currentUser.username) }">
              {{ getInitials(currentUser.username) }}
            </view>
            <input 
              v-model="replyTexts[comment._id]" 
              placeholder="Write a reply..." 
              @keyup.enter="addReply(comment._id)"
            />
            <text @click="addReply(comment._id)" class="send-reply-btn">Send</text>
          </view>
        </view>
      </view>

      <view class="new-comment">
        <view class="comment-avatar-text" :style="{ backgroundColor: getAvatarColor(currentUser.username) }">
          {{ getInitials(currentUser.username) }}
        </view>
        <input 
          v-model="newComment" 
          placeholder="Write a comment..." 
          @keyup.enter="addComment"
        />
        <text @click="addComment" class="send-comment-btn">Send</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    post: Object,
    currentUser: Object
  },
  data() {
    return {
      commentsVisible: false,
      newComment: '',
      activeReplyInput: null,
      replyTexts: {},
      isLiked: false
    }
  },
  mounted() {
    const likeKey = `like_${this.post._id}_${this.currentUser.userId}`;
    try {
      const storedLike = uni.getStorageSync(likeKey);
      if (storedLike !== '') {
        this.isLiked = storedLike === 'true';
      } else {
        this.isLiked = this.post.likes?.some(u => u._id === this.currentUser.userId);
      }
    } catch (e) {
      this.isLiked = this.post.likes?.some(u => u._id === this.currentUser.userId);
    }
  },
  methods: {
    toggleLike() {
      this.isLiked = !this.isLiked;
      const likeKey = `like_${this.post._id}_${this.currentUser.userId}`;
      try {
        uni.setStorageSync(likeKey, this.isLiked);
      } catch (e) {
        console.error('Failed to save like state:', e);
      }

      if (this.isLiked) {
        this.post.likes.push({ _id: this.currentUser.userId });
      } else {
        this.post.likes = this.post.likes.filter(u => u._id !== this.currentUser.userId);
      }

      this.$emit('like-post', this.post._id, this.isLiked);
    },
    toggleComments() {
      this.commentsVisible = !this.commentsVisible;
    },
    addComment() {
      if (!this.newComment.trim()) return;
      this.$emit('add-comment', {
        postId: this.post._id,
        commentText: this.newComment
      });
      this.newComment = '';
    },
    showReplyInput(commentId) {
      this.activeReplyInput = this.activeReplyInput === commentId ? null : commentId;
      if (!this.replyTexts[commentId]) {
        this.$set(this.replyTexts, commentId, '');
      }
    },
    addReply(commentId) {
      const replyText = this.replyTexts[commentId];
      if (!replyText || !replyText.trim()) return;
      this.$emit('add-reply', {
        postId: this.post._id,
        commentId: commentId,
        replyText: replyText
      });
      this.$set(this.replyTexts, commentId, '');
      this.activeReplyInput = null;
    },
    deletePost() {
      uni.showModal({
        title: 'Delete Post',
        content: 'Are you sure you want to delete this post?',
        success: (res) => {
          if (res.confirm) {
            this.$emit('delete-post', this.post._id);
          }
        }
      });
    },
    getInitials(username) {
      if (!username) return 'UU';
      const parts = username.split(' ');
      let initials = parts[0].charAt(0).toUpperCase();
      if (parts.length > 1) {
        initials += parts[1].charAt(0).toUpperCase();
      } else if (parts[0].length > 1) {
        initials += parts[0].charAt(1).toUpperCase();
      } else {
        initials += initials;
      }
      return initials;
    },
    getAvatarColor(username) {
      const colors = ['#1877f2', '#0d1b2a', '#70d6ff', '#fd7e14', '#6610f2', '#c2bbf0', '#e63946', '#43aa8b'];
      let hash = 0;
      for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
      }
      const index = Math.abs(hash % colors.length);
      return colors[index];
    },
    todoPost() {
      uni.navigateTo({
        url: `/pages/components/worker_todo?postId=${this.post._id}&content=${encodeURIComponent(this.post.content)}`
      });
    },
    formatRelativeTime(dateString) {
      const now = new Date();
      const targetDate = new Date(dateString);
      const diffMs = now - targetDate;
      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(diffMs / 60 / 1000);
      const hours = Math.floor(diffMs / 60 / 60 / 1000);
      const days = Math.floor(diffMs / 24 / 60 / 60 / 1000);
      const weeks = Math.floor(days / 7);

      if (seconds < 60) return 'Just now';
      if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      if (days === 1) return 'Yesterday';
      if (days < 7) return `${days} days ago`;
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    },
    previewImage() {
      if (!this.post.image) return;
      uni.previewImage({
        current: this.post.image,
        urls: [this.post.image]
      });
    }
  }
}
</script>

<style scoped>
.card {
  background-color: #ffffff;
  border-radius: 10px;
  margin-bottom: 15px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  margin-left: 10px;
}

.username {
  font-weight: 900;
  font-size: 15px;
  display: block;
}

.timestamp {
  font-size: 12px;
  color: #65676b;
  display: block;
}

.post-actions {
  margin-left: auto;
}

.delete-btn {
  /* color: #65676b; */
  background-color: red;
  color: #ffffff;
  border-radius: 6px;
  font-weight: 800;
  font-size: 11px;
  padding: 8px;
}

.todo-btn {
  /* color: #65676b; */
  background-color: orange;
  color: #ffffff;
  border-radius: 6px;
  font-weight: 800;
  font-size: 11px;
  padding: 8px;
}

.card-body {
  margin: 10px 0;
}

.content {
  font-size: 15px;
  line-height: 1.4;
}

.card-stats {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 8px 0;
  /* border-top: 1px solid #e4e6eb; */
  border-bottom: 1px solid #e4e6eb;
  display: flex;
  font-size: 13px;
  color: #65676b;
}

.likes-count {
  margin-right: 15px;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.action-btn {
  background: none;
  border: none;
  color: #65676b;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding-bottom: 3px;
  /* border-radius: 5px; */
}

.action-btn text {
  margin-right: 5px;
  font-size: 16px;
}

.action-btn.liked {
  color: #e0245e;
}

.comment-section {
  border-top: 1px solid #e4e6eb;
  padding-top: 10px;
}

.comment-item {
  display: flex;
  margin-bottom: 12px;
}

.comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: baseline;
  margin-bottom: 2px;
}

.comment-user {
  font-weight: 600;
  font-size: 13px;
  margin-right: 5px;
}

.comment-time {
  font-size: 11px;
  color: #65676b;
}

.comment-text {
  font-size: 14px;
  line-height: 1.4;
  background-color: #e9ecef;
  border-radius: 15px;
  padding: 10px;
}

.replies-container {
  margin-top: 8px;
  margin-left: 10px;
  padding-left: 10px;
  border-left: 2px solid #e4e6eb;
}

.reply-item {
  display: flex;
  margin-top: 8px;
}

.reply-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
}

.reply-content {
  flex: 1;
  background-color: #e9ecef;
  border-radius: 15px;
  padding: 10px;
}

.reply-header {
  display: flex;
  align-items: baseline;
}

.reply-user {
  font-weight: 600;
  font-size: 12px;
  margin-right: 5px;
}

.reply-time {
  font-size: 10px;
  color: #65676b;
}

.reply-text {
  font-size: 13px;
  line-height: 1.4;
}

.reply-btn {
  background: none;
  border: none;
  color: #65676b;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 0;
  margin-top: 2px;
}

.reply-input {
  display: flex;
  margin-top: 5px;
}

.reply-input input {
  flex: 1;
  padding: 6px 10px;
  border-radius: 18px;
  background-color: #f0f2f5;
  border: none;
  font-size: 13px;
}

.send-reply-btn {
	display: flex;
	align-items: center;
	background: none;
	border: none;
	color: #1877f2;
	font-weight: 600;
	font-size: 13px;
	padding: 0 8px;
}

.new-comment {
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e4e6eb;
}

.new-comment input {
  flex: 1;
  padding: 8px 12px;
  border-radius: 18px;
  background-color: #f0f2f5;
  border: none;
  font-size: 14px;
  margin: 0 8px;
}

.send-comment-btn {
  background: none;
  border: none;
  color: #1877f2;
  font-weight: 600;
  font-size: 14px;
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

.comment-avatar-text {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
  background-color: #1877f2;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 12px;
}

.reply-avatar-text {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
  background-color: #1877f2;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 10px;
}
.post-image {
  width: 100%;
  margin-top: 10px;
  border-radius: 8px;
  max-height: 200px;
  object-fit: cover;
}
</style>