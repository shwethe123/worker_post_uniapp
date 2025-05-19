<template>
  <view class="container">
    <view
      v-for="(leave, index) in leaves"
      :key="index"
      class="profile-card"
      :class="{ approved: leave.condition, pending: !leave.condition }"
    >
      <view class="image-container" v-if="leave.imageUrl">
        <image :src="leave.imageUrl" class="profile-photo" mode="aspectFill" />
      </view>

      <view class="info-section">
        <view class="name">{{ leave.mm_name }}</view>
        <view class="sub-id">ID: {{ leave.id }}</view>
		<view class="detail">🌓 ခွင့်အမျိုးအစား: <span style="background-color: #ff9770; padding: 4px; border-radius: 4px; color: white;">{{ leave.half_day || 'ရက်ပိုင်း' }}</span></view>
        <view class="detail">📍 တည်နေရာ: {{ leave.position }}</view>
        <view class="detail">🗓️ စတင်ရက်: {{ formatDate(leave.start_date) }}</view>
        <view class="detail">🗓️ ပြီးဆုံးရက်: {{ formatDate(leave.end_date) }}</view>
        <view class="detail">📝 {{ leave.remark }}</view>
        <view class="actions">
          <!-- Show 'Approve' button only if leave is not approved -->
          <button
            v-if="!leave.condition"
            @tap="requestPassword(leave, 'approve')"
          >
            ✔️ အတည်ပြု
          </button>

          <!-- Show 'Delete' button only if leave is not approved -->
          <button
            v-if="!leave.condition"
            class="delete"
            @tap="requestPassword(leave, 'delete')"
          >
            🗑 ဖျက်ရန်
          </button>

          <!-- Allow editing of leave only if it's approved -->
<!--          <button
            v-if="leave.condition"
            @tap="enableEdit(leave)"
          >
            ✏️ ပြုပြင်ရန်
          </button> -->
        </view>
      </view>
    </view>

    <view v-if="leaves.length === 0 && !loading" class="empty">📭 မှတ်တမ်း မရှိသေးပါ။</view>
    <view v-if="loading" class="loading">⏳ Loading...</view>
    <view v-if="error" class="error">❌ {{ error }}</view>

    <!-- Password Input Modal -->
    <view v-if="showPasswordModal" class="password-modal">
      <view class="modal-content">
        <view class="modal-header">Password Verification</view>
        <input
          v-model="enteredPassword"
          type="password"
          placeholder="Enter your password"
          class="password-input"
        />
        <view class="modal-actions">
          <button @tap="verifyPassword">Verify</button>
          <button @tap="cancelPasswordRequest">Cancel</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      leaves: [],
      loading: false,
      error: '',
      editingLeave: null, // Track the leave being edited
      showPasswordModal: false, // Show the password modal
      enteredPassword: '', // Store entered password
      currentLeave: null, // Store the leave to be modified
      actionType: '', // Store the action type (approve or delete)
    };
  },
  onLoad() {
    this.fetchLeaves();
  },
  methods: {
    fetchLeaves() {
      this.loading = true;
      axios.get('http://localhost:3000/api/leave')
        .then(res => {
          this.leaves = res.data;
        })
        .catch(err => {
          this.error = 'Server မချိတ်နိုင်ပါ';
        })
        .finally(() => {
          this.loading = false;
        });
    },
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return isNaN(d) ? '-' : d.toISOString().split('T')[0];
    },
    requestPassword(leave, action) {
      this.currentLeave = leave;
      this.actionType = action;
      this.showPasswordModal = true;
    },
    verifyPassword() {
      const correctPassword = 'yourPassword'; // Replace with actual password logic (e.g. from API)

      if (this.enteredPassword === correctPassword) {
        this.showPasswordModal = false;
        if (this.actionType === 'approve') {
          this.toggleCondition(this.currentLeave);
        } else if (this.actionType === 'delete') {
          this.deleteLeave(this.currentLeave._id);
        }
      } else {
        uni.showToast({ title: 'မှားယွင်းသော စကားဝှက်', icon: 'none' });
      }

      // Clear the password input
      this.enteredPassword = '';
    },
    cancelPasswordRequest() {
      this.showPasswordModal = false;
      this.enteredPassword = ''; // Clear the entered password when cancelling
    },
    toggleCondition(leave) {
      const newCondition = !leave.condition;
      axios.patch(`http://localhost:3000/api/leave/${leave._id}`, {
        condition: newCondition
      })
        .then(() => {
          leave.condition = newCondition;
          uni.showToast({ title: 'ပြင်ပြီးပါပြီ', icon: 'success' });
        })
        .catch((error) => {
          console.error('Error details:', error.response); // Log error response details
          uni.showToast({ title: 'ပြင်လို့မရပါ', icon: 'none' });
        });
    },
    deleteLeave(id) {
      uni.showModal({
        title: 'ဖျက်မည်သေချာပါသလား?',
        success: (res) => {
          if (res.confirm) {
            axios.delete(`http://localhost:3000/api/leave/${id}`)
              .then(() => {
                this.leaves = this.leaves.filter(leave => leave._id !== id);
                uni.showToast({ title: 'ဖျက်ပြီးပါပြီ', icon: 'success' });
              })
              .catch(() => {
                uni.showToast({ title: 'ဖျက်မရပါ', icon: 'none' });
              });
          }
        }
      });
    },
    enableEdit(leave) {
      // Set the leave to editing mode
      this.editingLeave = leave;
      // Open a form or prompt to edit the leave details (you can show a modal here)
      uni.showToast({ title: 'ပြုပြင်မှုကို လုပ်ဆောင်ပါ', icon: 'success' });
      // You could also navigate to another page or open a form to edit
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  background: #f0f4f8;
}
.profile-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-left: 6px solid transparent;
}
.profile-card.approved {
  border-left-color: #22c55e;
}
.profile-card.pending {
  border-left-color: #f59e0b;
}
.image-container {
  height: 180px;
  overflow: hidden;
}
.profile-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-top-right-radius: 8px;
  border-top-left-radius: 8px;
}
.info-section {
  padding: 16px;
}
.name {
  font-size: 18px;
  font-weight: bold;
}
.sub-id, .detail {
  font-size: 14px;
  color: #555;
  margin: 4px 0;
}
.actions {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
}
button {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 6px;
  background: #007aff;
  color: #fff;
}
button.delete {
  background: #ef4444;
}
.empty, .loading, .error {
  margin-top: 60px;
  color: #777;
  font-size: 16px;
}
.password-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
}
.modal-header {
  font-size: 18px;
  margin-bottom: 10px;
}
.password-input {
  width: 95%;
  padding: 8px;
  margin-bottom: 15px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.modal-actions {
  display: flex;
  justify-content: space-between;
}
.modal-actions button {
  padding: 8px 15px;
  font-size: 14px;
  background: #007aff;
  color: white;
  border-radius: 6px;
}
</style>
