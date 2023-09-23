import axios from 'axios';
const baseURL = 'https://fyp-my-strapi.onrender.com/api/';
const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const fileApi = {
  getFiles: async () => {
    try {
      const response = await axios.get(`${baseURL}upload/files`,{headers});
      return {
        isSuccess: true,
        data: response.data,
      }
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
};
export default fileApi;
