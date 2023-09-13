import axios from 'axios';
const baseURL = 'https://fyp-my-strapi.onrender.com/api/';
const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};
const userId = JSON.parse(localStorage.getItem("user"))?.id;
export const userApi = {
  getUsers: async () => {
    try {
      const response = await axios.get(`${baseURL}users`,{ headers });
      return {
        isSuccess: true,
        data: response.data,
      }
    } catch(error){
        return {
            isSuccess: false,
            error: error.response ? error.response.data.error.message : error.message,
          };
    }
  },
  getUserById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}users/${id}?populate=role`,{ headers });
      return {
        isSuccess: true,
        data: response.data,
      }
    } catch(error){
        return {
            isSuccess: false,
            error: error.response ? error.response.data.error.message : error.message,
          };
    }
  },
  updateUser: async (userData,id=0) => {
    let response;
    try {
      if(id==0){      
        response = await axios.put(`${baseURL}users/${userId}`,userData,{ headers });
      }else{
        response = await axios.put(`${baseURL}users/${id}`,userData,{ headers });
      }
      return {
        isSuccess: true,
        data: response.data,
      }
    } catch(error){
        return {
            isSuccess: false,
            error: error.response ? error.response.data.error.message : error.message,
          };
    }
  },
};