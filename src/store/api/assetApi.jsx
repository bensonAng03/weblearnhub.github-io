import axios from 'axios';
const baseURL = 'https://fyp-my-strapi.onrender.com/api/';
const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};

const assetApi = {
  getAssetById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}upload/files/${id}`, {headers});
      return {
        isSuccess: true,
        data: response.data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response
          ? error.response.data.error.message
          : error.message,
      };
    }
  },
  downloadAssetById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}upload/files/${id}`, {headers});
      return {
        isSuccess: true,
        data: response.data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response
          ? error.response.data.error.message
          : error.message,
      };
    }
  },
  addAsset: async (file) => {
    try {
      const formData = new FormData();
      formData.append('files', file);

      const response = await axios.post(`${baseURL}upload`, formData, { headers });
      console.log(response)
      return {
        isSuccess: true,
        data: response.data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response ? error.response.data.error.message : error.message,
      };
    }
  },
  deleteAsset: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}upload/files/${id}`, { headers });
      return {
        isSuccess: true,
        data: response.data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response ? error.response.data.error.message : error.message,
      };
    }
  },
};

export default assetApi;
