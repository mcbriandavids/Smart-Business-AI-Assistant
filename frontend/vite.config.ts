import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
<<<<<<< HEAD
=======
import path from "node:path";
>>>>>>> frontend

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
=======
  optimizeDeps: {
    include: ["react", "react/jsx-runtime", "react-dom"],
    dedupe: ["react", "react-dom"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
>>>>>>> frontend
  server: {
    port: 5173,
    proxy: {
      "/api": {
<<<<<<< HEAD
        target: process.env.VITE_API_BASE || "http://127.0.0.1:3000",
=======
        target: process.env.VITE_API_BASE || "http://127.0.0.1:5002",
>>>>>>> frontend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
