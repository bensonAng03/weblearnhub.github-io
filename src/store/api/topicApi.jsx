import axios from "axios";

const baseURL = "https://fyp-my-strapi.onrender.com/api/";

const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};

export const topicApi = {
  getTopicsById: async (id) => {
    try {
      const response = await axios.get(
        `${baseURL}courses/${id}?populate=topics`,
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  getTopicById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}topics/${id}`, { headers });
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  addTopic: async (topicData) => {
    try {
      const response = await axios.post(
        `${baseURL}topics`,
        { data: topicData },
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  updateTopic: async (topicData, id) => {
    try {
      const response = await axios.put(
        `${baseURL}topics/${id}`,
        { data: topicData },
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  delTopic: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}topics/${id}`, {
        headers,
      });
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
};
