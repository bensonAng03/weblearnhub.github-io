import axios from 'axios';
const baseURL = 'http://localhost:1337/api/';
const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const fileApi = {
  getFiles: async () => {
    try {
      const response = await axios.get(`${baseURL}upload/files`,{headers});
      console.log(response)
      return {
        isSuccess: true,
        data: response.data,
      }
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response ? error.response.data.error.message : error.message,
      };
    }
  },
};
export default fileApi;
