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
    if (config.headers && typeof config.headers.set === "function") {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      if (!config.headers) config.headers = {};
      (config.headers as any)["Authorization"] = `Bearer ${token}`;
    }
  }
  return config;
});
