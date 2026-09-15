import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});
// Attach JWT token to every protected API request
API.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export default API;