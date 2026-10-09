import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("proqure_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 Unauthorized if not on login or register page
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/register")) {
        localStorage.removeItem("proqure_token");
        localStorage.removeItem("proqure_user");
        localStorage.removeItem("proqure_org");
      }
    }
    return Promise.reject(error);
  }
);
