<template>
  <view class="container">
    <view v-for="(field, index) in formFields" :key="index" class="form-group">
      <text>{{ field.label }}</text>

      <input v-if="field.type === 'text'" v-model="form[field.key]" :placeholder="field.label" />
      <textarea v-if="field.type === 'textarea'" v-model="form[field.key]" :placeholder="field.label"></textarea>

      <picker v-if="field.type === 'picker'" :range="locations" @change="e => form[field.key] = locations[e.detail.value]">
        <view class="picker">{{ form[field.key] || 'ရွေးပါ' }}</view>
      </picker>

	  <view v-if="field.type === 'image'" class="image-upload">
		<view class="upload-button" @tap="chooseImage">
		  <image src="/static/camera.jpg" class="upload-icon" />
		  <text class="upload-label">ဓာတ်ပုံရွေးပါ</text>
		</view>
		<image v-if="imagePreview" :src="imagePreview" class="preview-image" />
	  </view>

    </view>

    <!-- Half-day Switch -->
    <view class="form-group">
      <text>နေ့တစ်ဝက်သာနားမည်</text>
      <switch :checked="isHalfDay" @change="onHalfDayToggle" />
    </view>

    <!-- Full Day Leave -->
    <view class="form-group" v-if="!isHalfDay">
      <text>စတင်ရက်</text>
      <picker mode="date" :value="form.start_date" @change="e => form.start_date = e.detail.value">
        <view class="picker">{{ form.start_date || 'ရွေးပါ' }}</view>
      </picker>
    </view>

    <view class="form-group" v-if="!isHalfDay">
      <text>ပြီးဆုံးရက်</text>
      <picker mode="date" :value="form.end_date" @change="e => form.end_date = e.detail.value">
        <view class="picker">{{ form.end_date || 'ရွေးပါ' }}</view>
      </picker>
    </view>

    <!-- Half Day Leave Picker -->
    <view class="form-group" v-if="isHalfDay">
      <text>နေ့တစ်ဝက်ရွေးပါ</text>
      <picker :range="halfDayOptions" @change="e => form.half_day = halfDayOptions[e.detail.value]">
        <view class="picker">{{ form.half_day || 'ရွေးပါ' }}</view>
      </picker>
    </view>

    <view class="form-group">
      <button @tap="submitForm">တင်သွင်းပါ</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      imageFilePath: '',
      imagePreview: '',
      isHalfDay: false,
      halfDayOptions: ['မနက်ပိုင်း', 'ညနေပိုင်း'],
      locations: ['ရန်ကုန်', 'နေပြည်တော်', 'မန္တလေး', 'တောင်ငူ', 'ပဲခူး'],
      form: {},
      formFields: [
        { key: 'id', label: 'ဝန်ထမ်းအိုင်ဒီ', type: 'text' },
        { key: 'mm_name', label: 'အမည် (မြန်မာ)', type: 'text' },
        { key: 'position', label: 'တည်နေရာ', type: 'picker' },
        { key: 'remark', label: 'မှတ်ချက်', type: 'textarea' },
        { key: 'imageUrl', label: 'ဓာတ်ပုံ', type: 'image' }
      ]
    };
  },
  onLoad() {
    this.resetForm();
  },
  methods: {
    onHalfDayToggle(e) {
      this.isHalfDay = e.detail.value;
      // Toggle change, clear related fields
      if (this.isHalfDay) {
        this.form.start_date = '';
        this.form.end_date = '';
      } else {
        this.form.half_day = '';
      }
    },

    resetForm() {
      const emptyForm = {};
      this.formFields.forEach(field => {
        emptyForm[field.key] = '';
      });
      emptyForm.start_date = '';
      emptyForm.end_date = '';
      emptyForm.half_day = '';
      this.form = emptyForm;
      this.imageFilePath = '';
      this.imagePreview = '';
      this.isHalfDay = false;
    },

    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: res => {
          this.imageFilePath = res.tempFilePaths[0];
          this.imagePreview = res.tempFilePaths[0];
        }
      });
    },
	submitForm() {
	  const required = ['id', 'mm_name', 'position', 'remark'];
	  for (let key of required) {
		if (!this.form[key]) {
		  return uni.showToast({ title: `${key} လိုအပ်ပါသည်`, icon: 'none' });
		}
	  }

	  if (!this.imageFilePath) {
		return uni.showToast({ title: 'ဓာတ်ပုံလိုအပ်သည်', icon: 'none' });
	  }

	  if (!this.isHalfDay) {
		if (!this.form.start_date || !this.form.end_date) {
		  return uni.showToast({ title: 'ရက်စွဲများလိုအပ်သည်', icon: 'none' });
		}
	  } else {
		if (!this.form.half_day) {
		  return uni.showToast({ title: 'နေ့တစ်ဝက် ရွေးရန် လိုအပ်သည်', icon: 'none' });
		}
	  }

	  const formData = {
		id: this.form.id,
		mm_name: this.form.mm_name,
		position: this.form.position,
		remark: this.form.remark,
		start_date: this.isHalfDay ? '' : this.form.start_date,
		end_date: this.isHalfDay ? '' : this.form.end_date,
		half_day: this.isHalfDay ? this.form.half_day : '',
		condition: this.isHalfDay
	  };

	  // ✅ Show loading
	  uni.showLoading({
		title: 'တင်သွင်းနေပါသည်...',
		mask: true
	  });

	  uni.uploadFile({
		url: 'http://localhost:3000/api/leave',
		filePath: this.imageFilePath,
		name: 'image',
		formData,
		success: (res) => {
		  uni.hideLoading(); // ✅ Hide loading

		  try {
			const data = JSON.parse(res.data);
			if (data && data._id) {
			  uni.showToast({ title: 'တင်သွင်းပြီးပါပြီ', icon: 'success' });
			  this.resetForm();
			} else {
			  uni.showToast({ title: 'Server response error', icon: 'none' });
			}
		  } catch (e) {
			console.error('Parse error:', e);
			uni.showToast({ title: 'JSON error', icon: 'none' });
		  }
		},
		fail: () => {
		  uni.hideLoading(); // ✅ Hide loading
		  uni.showToast({ title: 'တင်သွင်းမှု မအောင်မြင်ပါ', icon: 'none' });
		}
	  });
	}

  }
};
</script>

<style scoped>
.container {
  padding: 20px;
}
.form-group {
  margin-bottom: 20px;
}
input,
textarea,
.picker {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
}
button {
  background: #007aff;
  color: white;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
}

.image-upload {
  padding: 10px;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: space-between;
}

.upload-button {
  width: 100px;
  height: 100px;
  background-color: #f5f5f5;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  width: 100px;
  height: 100px;
}

.upload-label {
  margin-top: 5px;
  font-size: 14px;
  color: #333;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 80%; /* or a fixed width like 80px */
}

.preview-image {
  width: 100px;
  height: 100px;
  /* margin-top: 10px; */
  border: 1px solid #ddd;
}
</style>
