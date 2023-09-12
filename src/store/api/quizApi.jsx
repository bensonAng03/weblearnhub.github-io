import axios from 'axios';
const baseURL = 'http://localhost:1337/api/';
const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const userId = JSON.parse(localStorage.getItem("user"))?.id;
export const quizApi = {
  getQuizzes: async (type,id=0) => {
    try {
      let response;
      if(id==0){
        if (type == "customQuizzes") {
          response = await axios.get(`${baseURL}quizzes?filters[authorId]=${userId}`,{headers});
        }else if(type=="publishQuizzes"){
          response = await axios.get(`${baseURL}quizzes?filters[authorId][$ne]=${userId}&filters[status]=approved`,{headers});
        }
      }else{
        response = await axios.get(`${baseURL}quizzes?filters[authorId]=${id}`,{headers});
      }

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
  getQuizById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}quizzes/${id}`,{headers});
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
  
  addQuiz: async (quizData) => {
    try {
      const response = await axios.post(`${baseURL}quizzes`, { data: quizData },{headers});
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
  updateQuiz: async (quizData,id) => {
    try {
      const response = await axios.put(
        `${baseURL}quizzes/${id}`,
        { data: quizData },
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data.data,
      }
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  delQuiz: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}quizzes/${id}`,{headers});
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