// Centralized configuration loader
// Loads environment variables once and provides typed, defaulted values

require("dotenv").config();

const env = process.env.NODE_ENV || "development";
const isDev = env === "development";
const isTest = env === "test";
const isProd = env === "production";

const config = {
  env,
  isDev,
  isTest,
  isProd,

  // Server
  port: Number(process.env.PORT || 3000),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",

  // Database
  mongodbUri:
    process.env.MONGODB_URI || "mongodb://localhost:27017/smart-business-ai",

  // Security / Rate limit
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),

  // Compression
  compressionThreshold: Number(process.env.COMPRESSION_THRESHOLD || 1024),

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",

  // Feature flags
  enableMetrics: process.env.ENABLE_METRICS
    ? process.env.ENABLE_METRICS === "true"
    : env !== "production",
};

module.exports = config;
