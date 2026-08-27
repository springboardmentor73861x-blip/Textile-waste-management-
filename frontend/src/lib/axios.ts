import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  console.log("========== AXIOS REQUEST ==========");
  console.log("URL:", config.url);
  console.log("Token:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("Headers:", config.headers);
  console.log("===================================");

  return config;
});

export default api;