import axios from "axios";
import { getToken } from "../utils/auth";

const baseURL =
  import.meta.env.VITE_API_BASE?.trim() || "http://localhost:5000";

console.log("[client.ts] VITE_API_BASE:", import.meta.env.VITE_API_BASE);
console.log("[client.ts] axios baseURL:", baseURL);

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Remove token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
