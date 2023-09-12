import axios from "axios";

const baseURL = "https://fyp-web-learn-hub-strapi-n2yp.vercel.app/api/";

const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};

export const applyApi = {
  getApplies: async () => {
    try {
      const response = await axios.get(`${baseURL}applies`, { headers });
      return {
        isSuccess: true,
        data: response.data.data,
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
  getApplyById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}applies/${id}`, {headers});
      return {
        isSuccess: true,
        data: response.data.data,
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
  getAppliesByType: async (type) => {
    try {
      const response = await axios.get(`${baseURL}applies?filters[type]=${type}`, { headers });
      return {
        isSuccess: true,
        data: response.data.data,
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
  addApply: async (applyData) => {
    try {
      const response = await axios.post(
        `${baseURL}applies`,
        { data: applyData },
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
  updateApply: async (applyData, id) => {
    try {
      const response = await axios.put(
        `${baseURL}applies/${id}`,
        { data: applyData },
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data.data,
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
  delApply: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}applies/${id}`, {headers});
      return {
        isSuccess: true,
        data: response.data.data,
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
};