import axios from "axios";
const baseURL = "https://fyp-my-strapi.onrender.com/api/";
const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};
export const rankApi = {
  getRanks: async (courseId) => {
    try {
      let response = await axios.get(
        `${baseURL}ranks?filters[courseId]=${courseId}&sort[0]=score:desc&sort[1]=updatedAt:desc`,
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

  getRankById: async (id, courseId = 0) => {
    try {
      let response;
      if (courseId == 0) {
        response = await axios.get(`${baseURL}ranks?filters[userId]=${id}`, {
          headers,
        });
      } else {
        response = await axios.get(
          `${baseURL}ranks?filters[userId]=${id}&filters[courseId]=${courseId}`,
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
  addRank: async (rankData) => {
    try {
      const response = await axios.post(
        `${baseURL}ranks`,
        { data: rankData },
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
  updateRank: async (rankData, id) => {
    try {
      const response = await axios.put(
        `${baseURL}ranks/${id}`,
        { data: rankData },
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
};
