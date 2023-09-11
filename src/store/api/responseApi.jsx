import axios from 'axios';
const baseURL = 'http://localhost:1337/api/';
const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const userId = JSON.parse(localStorage.getItem("user"))?.id;
export const responseApi = {
  getResponses: async () => {
    try {
      const response = await axios.get(`${baseURL}responses`,{headers});
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
  getResponsesByUserId: async () => {
    try {
      const response = await axios.get(`${baseURL}responses?filters[authorId]=${userId}`,{headers});
      return {
        isSuccess: true,
        data: response.data.data,
      }
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  getResponseById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}responses/${id}`,{headers});
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
  addResponse: async (responseData) => {
    try {
      const response = await axios.post(`${baseURL}responses`, { data: responseData },{headers});
      return {
        isSuccess: true,
        data: response.data.data,
      }
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  updateResponse: async (responseData,id) => {
    try {
      const response = await axios.put(
        `${baseURL}responses/${id}`,
        { data: responseData },
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
  delResponse: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}responses/${id}`,{headers});
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