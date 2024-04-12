import axios from "axios";

export const getList = (currentPage = 1) => {
  return axios.get(`https://api.apiopen.top/getJoke?count=5&page=${currentPage}`);
};
