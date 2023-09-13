import axios from "axios";

const baseURL = "https://fyp-web-learn-hub-strapi-eei1xrsgj-bensonang03.vercel.app/api/";

const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};

export const noteApi = {
  getNotes: async (id = 0) => {
    let response;
    try {
      if (id == 0) {
        response = await axios.get(`${baseURL}notes`, { headers });
      } else {
        response = await axios.get(`${baseURL}notes?filters[courseId]=${id}`, {
          headers,
        });
      }
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response
          ? error.response.data.error.message
          : error.message,
      };
    }
  },
  getNotesByUserId: async (id) => {
    try {
      let response = await axios.get(
        `${baseURL}notes?filters[authorId]=${id}`,
        { headers }
      );

      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response
          ? error.response.data.error.message
          : error.message,
      };
    }
  },
  getNoteById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}notes/${id}`, { headers });
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response
          ? error.response.data.error.message
          : error.message,
      };
    }
  },
  addNote: async (noteData) => {
    try {
      const response = await axios.post(
        `${baseURL}notes`,
        { data: noteData },
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response
          ? error.response.data.error.message
          : error.message,
      };
    }
  },
  updateNote: async (noteData, id) => {
    try {
      const response = await axios.put(
        `${baseURL}notes/${id}`,
        { data: noteData },
        { headers }
      );
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response
          ? error.response.data.error.message
          : error.message,
      };
    }
  },
  delNote: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}notes/${id}`, { headers });
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error.response
          ? error.response.data.error.message
          : error.message,
      };
    }
  },
};
