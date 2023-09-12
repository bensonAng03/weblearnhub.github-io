import axios from 'axios';

const baseURL = 'https://fyp-web-learn-hub-strapi-n2yp.vercel.app/api/';

const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};

const topicApi = {
  getTopicsById: async (id) => {
    try {
      const response = await axios.get(
        `${baseURL}courses/${id}?populate[0]=topics&populate[1]=topics.assests`,
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response ? error.response.data.error.message : error.message,
      };
    }
  },
  getTopicById: async (id) => {
    try {
      const response = await axios.get(
        `${baseURL}topics/${id}`,
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response ? error.response.data.error.message : error.message,
      };
    }
  },
  addTopic: async ( topicData) => {
    try {
      const response = await axios.post(
        `${baseURL}topics`,
        { data: topicData },
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response ? error.response.data.error.message : error.message,
      };
    }
  },
  updateTopic: async (topicData,id) => {
    try {
      const response = await axios.put(
        `${baseURL}topics/${id}`,
        { data: topicData },
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response ? error.response.data.error.message : error.message,
      };
    }
  },
  delTopic: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}topics/${id}`,{headers});
      return {
        isSuccess: true,
        data: response.data.data,
      }
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response ? error.response.data.error.message : error.message
      }
    }
  }
};

export default topicApi;
