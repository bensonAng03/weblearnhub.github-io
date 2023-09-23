import axios from "axios";

const baseURL = "https://fyp-my-strapi.onrender.com/api/";

const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const userId = JSON.parse(localStorage.getItem("user"))?.id;

export const likeApi = {
  getLikes: async (noteId = null) => {
    try {
      let response;
      if (noteId !== null) {
        response = await axios.get(
          `${baseURL}likes?filters[userId]=${userId}&filters[noteId]=${noteId}`,
          { headers }
        );
      } else {
        response = await axios.get(
          `${baseURL}likes?filters[userId]=${userId}`,
          { headers }
        );
      }
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  getLikeById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}likes/${id}`, { headers });
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  addLike: async (likeData) => {
    try {
      const response = await axios.post(
        `${baseURL}likes`,
        { data: likeData },
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
  delNote: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}likes/${id}`, { headers });
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
