import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const TOKEN_KEY = "token";
export const USER_KEY = "user";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !location.pathname.includes("/login")) {
      const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
      location.href = `${basePath}/login`;
    }
    return Promise.reject(error);
  },
);
export default api;
