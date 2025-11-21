import axios from "axios";
import { getToken } from "../utils/auth";

function resolveBaseURL(): string {
  const fromEnv = import.meta.env.VITE_API_BASE?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, port } = window.location;
    const isLocalhost = ["localhost", "127.0.0.1"].includes(hostname);

    if (isLocalhost) {
      const devPorts = new Set(["5173", "5174", "4173", "4174"]);
      const targetPort = !port || devPorts.has(port) ? "3000" : port;
      return `${protocol}//${hostname}:${targetPort}`;
    }

    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  }

  return "http://localhost:3000";
}

const baseURL = resolveBaseURL();

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
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
