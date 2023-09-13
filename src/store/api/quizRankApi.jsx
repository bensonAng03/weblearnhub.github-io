import axios from 'axios';
const baseURL = 'https://fyp-web-learn-hub-strapi-eei1xrsgj-bensonang03.vercel.app/api/';
const token = localStorage.getItem('token');
const headers = token ? { Authorization: `Bearer ${token}` } : {};
export const quizRankApi = {
  getQuizRanks: async (startIndex,courseId,studentsArr=[]) => {
    console.log(studentsArr)
    try {
      let response;
      if (studentsArr.length > 0) {
        let userIdFilters;
        if(studentsArr.length==1){
          userIdFilters=`filters[userId]=${studentsArr[0]}`
        }else{
         userIdFilters = studentsArr.map(userId => `filters[$or][${studentsArr.indexOf(userId)}][userId][$eq]=${userId}`).join('&');
        }
        response = await axios.get(`${baseURL}quiz-ranks?${userIdFilters}`, { headers });
      } else {
        response = await axios.get(`${baseURL}quiz-ranks?filters[courseId]=${courseId}&pagination[limit]=25&pagination[start]=${startIndex}&sort[0]=score:desc&sort[1]=updatedAt:desc`, { headers });
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
  
  getQuizRankById: async (id) => {
    try {
      const response = await axios.get(`${baseURL}quiz-ranks?filters[userId]=${id}`,{headers});
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
  addQuizRank: async (quizRankData) => {
    try {
      const response = await axios.post(`${baseURL}quiz-ranks`, { data: quizRankData },{headers});
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
  updateQuizRank: async (quizRankData,id) => {
    try {
      const response = await axios.put(
        `${baseURL}quiz-ranks/${id}`,
        { data: quizRankData },
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