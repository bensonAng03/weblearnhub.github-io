import axios from 'axios';

const baseURL = 'http://localhost:1337/api/';

const token = localStorage.getItem('token');
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
      }
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response ? error.response.data.error.message : error.message,
      };
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
      }
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response ? error.response.data.error.message : error.message,
      };
    }
  },
  updateQuestion: async (questionData,id) => {
    try {
      const response = await axios.put(
        `${baseURL}questions/${id}`,
        { data: questionData },
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
  delQuestion: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}questions/${id}`,{headers});
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
};
