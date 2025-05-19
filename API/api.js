// API/api.js
import { ref } from 'vue';

// For loading data
export const worker_leave = () => {
  const worker_data = ref([]);
  const error = ref('');

  const load = async () => {
    try {
      const res = await new Promise((resolve, reject) => {
        uni.request({
          url: 'http://192.168.16.32:3000/api/posts',
          method: 'GET',
          header: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer your_token_here`  // Add the Bearer token here
          },
          success(res) {
            resolve(res);
          },
          fail(error) {
            reject(error);
          }
        });
      });

      if (res.statusCode === 200) {
        worker_data.value = res.data;
      } else {
        error.value = `Error: ${res.statusCode}`;
        console.log("Fetch API Failed", res.statusCode);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      error.value = 'An error occurred while fetching data';
    }
  };

  return { worker_data, error, load };
};

// For inserting form data
const insertWorker = (data) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: 'http://192.168.16.32:3000/api/leave', // Replace with actual POST endpoint
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer your_token_here`  // Add Bearer token if required
      },
      success(res) {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res);
        } else {
          reject(res);
        }
      },
      fail(err) {
        reject(err);
      }
    });
  });
};

// Export as default
export default {
  insertWorker,
  worker_leave
};
