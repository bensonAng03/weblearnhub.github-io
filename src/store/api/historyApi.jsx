import axios from 'axios';
const baseURL = 'https://fyp-web-learn-hub-strapi-eei1xrsgj-bensonang03.vercel.app/api/';
const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const userId = JSON.parse(localStorage.getItem("user"))?.id;
export const historyApi = {
  geHistoryById: async () => {
    try {
      const response = await axios.get(`${baseURL}histories?filters[userId]=${userId}`,{ headers });
      return {
        isSuccess: true,
        data: response.data.data,
      }
    } catch(error){
        return {
            isSuccess: false,
            error: error.response ? error.response.data.error.message : error.message,
          };
    }
  },
  addHistory: async (historyData) => {
    try {
      const response = await axios.post(`${baseURL}histories`,{data:historyData},{ headers });
      return {
        isSuccess: true,
        data: response.data.data,
      }
    } catch(error){
        return {
            isSuccess: false,
            error: error.response ? error.response.data.error.message : error.message,
          };
    }
  },
  updateHistory: async (historyData,id) => {
    try {
      const response = await axios.put(`${baseURL}histories/${id}`,{data:historyData },{ headers });
      return {
        isSuccess: true,
        data: response.data.data,
      }
    } catch(error){
        return {
            isSuccess: false,
            error: error.response ? error.response.data.error.message : error.message,
          };
    }
  }
};