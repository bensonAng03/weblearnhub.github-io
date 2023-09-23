import axios from "axios";
const baseURL = "https://fyp-my-strapi.onrender.com/api/";
const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};
export const noteRankApi = {
  getNoteRanks: async (courseId) => {
    try {
      let response = await axios.get(`${baseURL}note-ranks?filters[courseId]=${courseId}&sort[0]=score:desc&sort[1]=updatedAt:desc`, { headers });
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  getNoteRankById: async (id, courseId = 0) => {
    try {
      let response;
      if (courseId == 0) {
        response = await axios.get(
          `${baseURL}note-ranks?filters[userId]=${id}`,
          { headers }
        );
      } else {
        response = await axios.get(
          `${baseURL}note-ranks?filters[userId]=${id}&filters[courseId]=${courseId}`,
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
  getNotesByUserId: async (id) => {
    try {
      let response = await axios.get(
        `${baseURL}note-ranks?filters[authorId]=${id}`,
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
  addNoteRank: async (noteRankData) => {
    try {
      const response = await axios.post(
        `${baseURL}note-ranks`,
        { data: noteRankData },
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
  updateNoteRank: async (noteRankData, id) => {
    try {
      const response = await axios.put(
        `${baseURL}note-ranks/${id}`,
        { data: noteRankData },
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
