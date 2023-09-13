import axios from 'axios';
const baseURL = 'https://fyp-web-learn-hub-strapi-eei1xrsgj-bensonang03.vercel.app/api/';
const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};
export const noteRankApi = {
  getNoteRanks: async (startIndex,courseId,studentsArr=[]) => {
    try {
      let response;
      if (studentsArr.length > 0) {
        let userIdFilters;
        if(studentsArr.length==1){
          userIdFilters=`filters[userId]=${studentsArr[0]}`
        }else{
         userIdFilters = studentsArr.map(userId => `filters[$or][${studentsArr.indexOf(userId)}][userId][$eq]=${userId}`).join('&');
        }
        response = await axios.get(`${baseURL}note-ranks?${userIdFilters}`, { headers });
      }else{
        response = await axios.get(`${baseURL}note-ranks?filters[courseId]=${courseId}&pagination[limit]=25&pagination[start]=${startIndex}&sort[0]=score:desc&sort[1]=updatedAt:desc`,{headers});
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
  getNoteRankById: async (id,courseId=0) => {
    try {
      let response;
      if(courseId!==0){
        response = await axios.get(`${baseURL}note-ranks?filters[userId]=${id}`,{headers});
      }else{
        response = await axios.get(`${baseURL}note-ranks?filters[userId]=${id}&filters[courseId]=${courseId}`,{headers});
      
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
  getNotesByUserId: async (id) => {
    try {
      let response = await axios.get(`${baseURL}note-ranks?filters[authorId]=${id}`,{headers});
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
  addNoteRank: async (noteRankData) => {
    try {
      const response = await axios.post(`${baseURL}note-ranks`, { data: noteRankData },{headers});
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
  updateNoteRank: async (noteRankData,id) => {
    try {
      const response = await axios.put(
        `${baseURL}note-ranks/${id}`,
        { data: noteRankData },
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