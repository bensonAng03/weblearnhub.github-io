import axios from "axios";
const baseURL = "https://fyp-my-strapi.onrender.com/api/";
const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const userId = JSON.parse(localStorage.getItem("user"))?.id;
export const reportApi = {
  getReports: async () => {
    try {
      const response = await axios.get(`${baseURL}reports`, { headers });
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  getReportsByUserId: async () => {
    try {
      const response = await axios.get(
        `${baseURL}reports?filters[authorId]=${userId}`,
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
  getReportById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}reports/${id}`, { headers });
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  addReport: async (reportData) => {
    try {
      const response = await axios.post(
        `${baseURL}reports`,
        { data: reportData },
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
  updateReport: async (reportData, id) => {
    try {
      const response = await axios.put(
        `${baseURL}reports/${id}`,
        { data: reportData },
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
  delReport: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}reports/${id}`, {
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
