import axios from 'axios';

const baseURL = 'https://fyp-my-strapi.onrender.com/api/';

const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};

export const assignmentApi = {
  getAssignmentsById: async (id) => {
    try {
      const response = await axios.get(
        `${baseURL}courses/${id}?populate[0]=assignments&populate[1]=assignments.assests`,
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
  getAssignmentById: async (id) => {
    try {
      const response = await axios.get(
        `${baseURL}assignments/${id}`,
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
  addAssignment: async (assignmentData) => {
    try {
      const response = await axios.post(
        `${baseURL}assignments`,
        { data: assignmentData },
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
  updateAssignment: async (assignmentData,id) => {
    try {
      const response = await axios.put(
        `${baseURL}assignments/${id}`,
        { data: assignmentData },
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
  delAssignment: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}assignments/${id}`,{headers});
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
