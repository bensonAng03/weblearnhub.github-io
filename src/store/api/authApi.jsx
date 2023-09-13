import axios from "axios";
const baseURL = "https://fyp-my-strapi.onrender.com/api/";
const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};
export const authApi = {
  register: async (user) => {
    try {
      const response = await axios.post(`${baseURL}auth/local/register`, user);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  login: async (user) => {
    try {
      const response = await axios.post(`${baseURL}auth/local`, user);
      console.log(response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  changePassword: async (user) => {
    try {
      const response = await axios.post(
        `${baseURL}auth/change-password`,
        user,
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  getUserIdList: async (user) => {
    try {
      const response = await axios.post(`${baseURL}auth/local`, user);
      return response.data;
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
};
