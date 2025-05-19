<template>
  <view class="container">
    <view class="header">
      <input v-model="newTask" placeholder="လုပ်စရာရေးပါ..." @confirm="addTask" />
      <button class="add-btn" @click="addTask">➕ ထည့်မယ်</button>
    </view>

    <view class="task-list">
      <view :class="['task-item', task.status]" v-for="(task, index) in tasks" :key="task.id">
        <view class="task-text">
          <template v-if="editIndex === index">
            <input v-model="editText" class="edit-input" />
          </template>
          <template class="task_group" v-else>
            <view class="task_item">
              <text :class="['task-label', task.status]">{{ task.text }}</text>
              <text class="status-label">{{ getStatusLabel(task.status) }}</text>
            </view>
            <view style="display: flex; flex-direction: column">
              <text style="font-size: 12px; color: #748cab; margin-left: 6px;">{{ formatRelativeTime(task.createdAt) }}</text>
              <text :class="['task-label', task.status]">{{ task.content }}</text>
			  <text style="font-size: 12px; color: #748cab; margin-left: 6px;">{{ formatRelativeTime(task.user_time) }} တွင်ပြင်ဆင်ခဲ့သည်။</text>
            </view>
          </template>
        </view>

        <!-- Show Actions Only When See More is Toggled -->
        <view v-if="task.showActions" class="action-group">
          <view class="actions">
            <button class="start-btn" @click="startCheck(index)">✅ စတင်</button>
            <button class="pause-btn" @click="notWork(index)">⏸ မလုပ်သေး</button>
            <button v-if="task.status === 'working'" class="success-btn" @click="markAsDone(index)">✅ အောင်မြင်</button>
          </view>

          <view class="actions">
            <template v-if="editIndex === index">
              <button class="add-btn" @click="saveEdit(index)">💾 သိမ်းမယ်</button>
              <button class="delete-btn" @click="cancelEdit">❌ မပြင်တော့ဘူး</button>
            </template>
            <template v-else>
              <button class="edit-btn" @click="startEdit(index)">✏ ပြင်မယ်</button>
              <button class="delete-btn" @click="deleteTask(index)">🗑 ဖျက်မယ်</button>
            </template>
          </view>
        </view>

        <!-- See More Toggle -->
        <view style="background-color: #29B6F6; font-size: 13px; color: white; width: 28%; text-align: center; border-radius: 6px; padding: 6px;" @click="toggleActions(index)">
          <text>{{ task.showActions ? 'Hide' : 'See More' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userID: '',
      userContent: '',
      newTask: '',
      tasks: [],
      editIndex: null,
      editText: ''
    };
  },
  onLoad(options) {
    const postId = options.postId;
    const content = decodeURIComponent(options.content);
    this.postId = postId;
    this.postContent = content;
    console.log('Post ID:', postId);
    console.log('Content:', content);
    this.fetchTasks();
  },
  methods: {
    fetchTasks() {
      uni.request({
        url: 'http://192.168.16.32:3000/api/tasks',
        method: 'GET',
        success: (res) => {
          if (Array.isArray(res.data)) {
            this.tasks = res.data.map(item => ({
              id: item._id,
              text: item.task,
              content: item.content,
              user_time: item.user_time,
              createdAt: item.createdAt,
              status: item.state,
              showActions: false // NEW
            }));
          } else {
            console.error('Invalid data format:', res.data);
          }
        },
        fail: (err) => {
          console.error('Fetch failed', err);
        }
      });
    },

    addTask() {
      if (!this.newTask.trim()) return;

      uni.request({
        url: 'http://192.168.16.32:3000/api/tasks',
        method: 'POST',
        data: {
          userID: this.userID,
          userContent: this.userContent,
          task: this.newTask,
          state: 'pending',
          user_time: new Date().toISOString(),
          postId: this.postId,
          content: this.postContent
        },
        success: () => {
          this.newTask = '';
          this.fetchTasks();
          uni.showToast({
            title: 'Task added ✅',
            icon: 'success',
            duration: 1500
          });
        },
        fail: (err) => {
          console.error('Add failed', err);
        }
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

    updateTaskStatus(index, newState) {
      const task = this.tasks[index];
      uni.request({
        url: `http://192.168.16.32:3000/api/tasks/${task.id}`,
        method: 'PATCH',
        data: {
          task: task.text,
          state: newState,
          user_time: new Date().toISOString()
        },
        success: () => {
          this.fetchTasks();
        },
        fail: (err) => {
          console.error('Update failed', err);
        }
      });
    },

    startCheck(index) {
      this.updateTaskStatus(index, 'working');
    },

    notWork(index) {
      this.updateTaskStatus(index, 'pending');
    },

    markAsDone(index) {
      this.updateTaskStatus(index, 'done');
      uni.showToast({
        title: 'Task completed ✅',
        icon: 'success',
        duration: 1500
      });
    },

    deleteTask(index) {
      const task = this.tasks[index];
      uni.request({
        url: `http://192.168.16.32:3000/api/tasks/${task.id}`,
        method: 'DELETE',
        success: () => {
          this.fetchTasks();
          uni.showToast({
            title: 'Task deleted 🗑',
            icon: 'success',
            duration: 1500
          });
        },
        fail: (err) => {
          console.error('Delete failed', err);
        }
      });
    },

    startEdit(index) {
      this.editIndex = index;
      this.editText = this.tasks[index].text;
    },

    saveEdit(index) {
      if (!this.editText.trim()) return;
      const task = this.tasks[index];
      uni.request({
        url: `http://192.168.16.32:3000/api/tasks/${task.id}`,
        method: 'PATCH',
        data: {
          task: this.editText,
          state: task.status,
          user_time: new Date().toISOString()
        },
        success: () => {
          this.editIndex = null;
          this.editText = '';
          this.fetchTasks();
          uni.showToast({
            title: 'Task updated ✏️',
            icon: 'success',
            duration: 1500
          });
        },
        fail: (err) => {
          console.error('Edit failed', err);
        }
      });
    },

    cancelEdit() {
      this.editIndex = null;
      this.editText = '';
    },

    toggleActions(index) {
      this.tasks[index].showActions = !this.tasks[index].showActions;
    },

    getStatusLabel(status) {
      if (status === 'done') return '✔ ပြီးသွားပါပြီ';
      if (status === 'working') return '🔄 လုပ်နေသည်';
      return '⏸ မလုပ်သေးပါ';
    }
  }
}
</script>

<style>
.container {
  padding: 40rpx;
  background: linear-gradient(to bottom, #e0f7fa, #ffffff);
  min-height: 100vh;
  font-family: 'Helvetica Neue', sans-serif;
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 40rpx;
  background: rgba(255, 255, 255, 0.4);
  padding: 20rpx;
  border-radius: 20rpx;
  backdrop-filter: blur(10px);
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
}

input {
  flex: 1;
  padding: 24rpx;
  border: none;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.8);
  font-size: 28rpx;
  /* box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05); */
}

.edit-input {
  flex: 1;
  padding: 24rpx;
  border-radius: 16rpx;
  background: rgba(255, 255, 255, 0.9);
  font-size: 28rpx;
  margin-left: 20rpx;
  border: 1px solid #03A9F4;
  box-shadow: 0 4rpx 10rpx rgba(3, 169, 244, 0.1);
}

.add-btn {
  padding: 20rpx 32rpx;
  background: linear-gradient(to right, #4CAF50, #81C784);
  color: white;
  border-radius: 20rpx;
  font-size: 28rpx;
  border: none;
  box-shadow: 0 6rpx 12rpx rgba(76, 175, 80, 0.3);
}

.task-list {
  padding-bottom: 30rpx;
}

.task-item {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(6px);
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 6rpx 14rpx rgba(0, 0, 0, 0.06);
  border-left: 12rpx solid transparent;
  transition: border-color 0.3s ease;
}

.task-item.pending {
  border-left-color: #78909C;
}
.task-item.working {
  border-left-color: #FFA000;
}
.task-item.done {
  border-left-color: #388E3C;
}

.task-text {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16rpx;
}

.task-label {
  font-size: 30rpx;
  margin-left: 16rpx;
  color: #333;
  flex: 1;
  word-break: break-word;
}
.task-label.done {
  text-decoration: line-through;
  color: #9E9E9E;
}
.task-label.working {
  color: #FF9800;
}
.task-label.pending {
  color: #607D8B;
}

.action-group {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(6px);
  border-radius: 20rpx;
  padding: 20rpx;
  margin-top: 16rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
}

.actions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.status-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #444;
  background: #E0F2F1;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
}

button {
  padding: 14rpx 26rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: white;
  transition: background 0.3s, transform 0.2s;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.08);
}

button:active {
  transform: scale(0.95);
}

/* Individual Buttons */
.start-btn {
  background: linear-gradient(to right, #03A9F4, #29B6F6);
  width: 100%;
  padding: 2px;
  padding: 2px 8px 2px 8px;
}
.pause-btn {
  background: linear-gradient(to right, #FFC107, #FFD54F);
  width: 100%;
  color: #333;
  padding: 2px 8px 2px 8px;
}
.success-btn {
  background: linear-gradient(to right, #4CAF50, #81C784);
  width: 100%;
  padding: 2px;
  padding: 2px 8px 2px 8px;
}
.edit-btn {
  background: linear-gradient(to right, #7E57C2, #9575CD);
  width: 100%;
  padding: 2px;
  padding: 2px 8px 2px 8px;
}
.delete-btn {
  background: linear-gradient(to right, #E53935, #EF5350);
  width: 100%;
  padding: 2px;
  padding: 2px 8px 2px 8px;
}
.add-btn {
  background: linear-gradient(to right, #388E3C, #66BB6A);
  padding: 2px;
  padding: 2px 8px 2px 8px;
}
.task_item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}
</style>
