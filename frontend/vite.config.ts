import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const API = process.env.VITE_API_BASE || "http://127.0.0.1:5002";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: API,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: process.env.VITE_API_BASE || "http://127.0.0.1:5002",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
