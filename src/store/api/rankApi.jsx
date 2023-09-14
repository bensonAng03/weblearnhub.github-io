import axios from 'axios';
const baseURL = 'https://fyp-my-strapi.onrender.com/api/';
const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};
export const rankApi = {
  getRanks: async (startIndex,courseId,studentsArr=[]) => {
    try {
      let response;
      if (studentsArr.length > 0) {
        let userIdFilters;
        if(studentsArr.length==1){
          userIdFilters=`filters[userId]=${studentsArr[0]}`
        }else{
         userIdFilters = studentsArr.map(userId => `filters[$or][${studentsArr.indexOf(userId)}][userId][$eq]=${userId}`).join('&');
        }
        response = await axios.get(`${baseURL}ranks?${userIdFilters}`, { headers });
      } else {
        response = await axios.get(`${baseURL}ranks?filters[courseId]=${courseId}&pagination[limit]=25&pagination[start]=${startIndex}&sort[0]=score:desc&sort[1]=updatedAt:desc`,{headers});
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
  
  getRankById: async (id,courseId=0) => {
    try {
      let response;
      if(courseId==0){
        response = await axios.get(`${baseURL}ranks?filters[userId]=${id}`,{headers});
      }else{
        response = await axios.get(`${baseURL}ranks?filters[userId]=${id}&filters[courseId]=${courseId}`,{headers});
      
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
  addRank: async (rankData) => {
    try {
      const response = await axios.post(`${baseURL}ranks`, { data: rankData },{headers});
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
  updateRank: async (rankData,id) => {
    try {
      const response = await axios.put(
        `${baseURL}ranks/${id}`,
        { data: rankData },
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
};