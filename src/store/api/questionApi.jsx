import axios from "axios";

const baseURL = "https://fyp-my-strapi.onrender.com/api/";

const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};

export const questionApi = {
  getQuestionsById: async (id) => {
    try {
      const response = await axios.get(
        `${baseURL}quizzes/${id}?populate=questions`,
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
  addQuestion: async (questionData) => {
    try {
      const response = await axios.post(
        `${baseURL}questions`,
        { data: questionData },
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
  updateQuestion: async (questionData, id) => {
    try {
      const response = await axios.put(
        `${baseURL}questions/${id}`,
        { data: questionData },
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
  delQuestion: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}questions/${id}`, {
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
