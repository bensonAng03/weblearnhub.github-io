import axios from "axios";
const baseURL = "https://fyp-my-strapi.onrender.com/api/";
const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};
export const quizRankApi = {
  getQuizRanks: async (courseId) => {
    try {
      let response = await axios.get(
        `${baseURL}quiz-ranks?filters[courseId]=${courseId}&sort[0]=score:desc&sort[1]=updatedAt:desc`,
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

  getQuizRankById: async (id, courseId = 0) => {
    try {
      let response;
      if (courseId == 0) {
        response = await axios.get(
          `${baseURL}quiz-ranks?filters[userId]=${id}`,
          { headers }
        );
      } else {
        response = await axios.get(
          `${baseURL}quiz-ranks?filters[userId]=${id}&filters[courseId]=${courseId}`,
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
  addQuizRank: async (quizRankData) => {
    try {
      const response = await axios.post(
        `${baseURL}quiz-ranks`,
        { data: quizRankData },
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
  updateQuizRank: async (quizRankData, id) => {
    try {
      const response = await axios.put(
        `${baseURL}quiz-ranks/${id}`,
        { data: quizRankData },
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
