import axios from "axios";
const baseURL = "https://fyp-my-strapi.onrender.com/api/";
const token = localStorage.getItem("token");
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const userId = JSON.parse(localStorage.getItem("user"))?.id;
export const courseApi = {
  getCourses: async (type, keyword = null) => {
    try {
      let response;
      if (keyword == null) {
        if (userId) {
          if (type == "customCourses") {
            response = await axios.get(
              `${baseURL}courses?filters[authorId]=${userId}`,
              { headers }
            );
          } else {
            response = await axios.get(
              `${baseURL}courses?filters[authorId][$ne]=${userId}&filters[status]=approved`,
              { headers }
            );
          }
        } else {
          response = await axios.get(
            `${baseURL}courses?&filters[status]=approved`,
            { headers }
          );
        }
      } else {
        response = await axios.get(
          `${baseURL}courses?_q=${keyword}&filters[status]=approved`,
          {
            headers,
          }
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
  getCoursesByUserId: async (id) => {
    try {
      let response = await axios.get(
        `${baseURL}courses?filters[authorId]=${id}`,
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
  getCourseById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}courses/${id}`, { headers });
      return {
        isSuccess: true,
        data: response.data.data,
      };
    } catch (error) {
      const errorMessage = error.response.data.error.message;
      throw new Error(errorMessage);
    }
  },
  addCourse: async (courseData) => {
    try {
      const response = await axios.post(
        `${baseURL}courses`,
        { data: courseData },
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
  updateCourse: async (courseData, id) => {
    try {
      const response = await axios.put(
        `${baseURL}courses/${id}`,
        { data: courseData },
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
  delCourse: async (id) => {
    try {
      const response = await axios.delete(`${baseURL}courses/${id}`, {
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
