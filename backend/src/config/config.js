// Centralized configuration loader
// Loads environment variables once and provides typed, defaulted values

require("dotenv").config();
const envsafe = require("./env");

const env = envsafe.NODE_ENV || process.env.NODE_ENV || "development";
const isDev = env === "development";
const isTest = env === "test";
const isProd = env === "production";

const frontendUrls = (() => {
  if (process.env.FRONTEND_URLS) {
    return process.env.FRONTEND_URLS.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  // Default allowlist for dev: Vite and fallback React port
  return [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];
})();

const config = {
  env,
  isDev,
  isTest,
  isProd,

  // Server
  port: Number(process.env.PORT || envsafe.PORT || 3000),
  // Keep single URL for backward compatibility, default to Vite dev port
  frontendUrl:
    process.env.FRONTEND_URL || envsafe.FRONTEND_URL || "http://localhost:5173",
  // Allowlist of acceptable frontend origins (used by app-level CORS)
  frontendUrls,

  // Database
  mongodbUri:
    envsafe.MONGODB_URI ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/smart-business-ai",

  // Security / Rate limit
  rateLimitWindowMs: Number(
    envsafe.RATE_LIMIT_WINDOW_MS ||
      process.env.RATE_LIMIT_WINDOW_MS ||
      15 * 60 * 1000
  ),
  rateLimitMax: Number(
    envsafe.RATE_LIMIT_MAX || process.env.RATE_LIMIT_MAX || 100
  ),

  // Compression
  compressionThreshold: Number(
    envsafe.COMPRESSION_THRESHOLD || process.env.COMPRESSION_THRESHOLD || 1024
  ),

  // Logging
  logLevel: envsafe.LOG_LEVEL || process.env.LOG_LEVEL || "info",

  // Feature flags
  enableMetrics:
    typeof process.env.ENABLE_METRICS !== "undefined"
      ? process.env.ENABLE_METRICS === "true"
      : typeof envsafe.ENABLE_METRICS !== "undefined"
      ? envsafe.ENABLE_METRICS === "true"
      : env !== "production",

  // Security/Infra
  trustProxy: envsafe.TRUST_PROXY ?? process.env.TRUST_PROXY, // string | undefined
  metricsToken: envsafe.METRICS_TOKEN ?? process.env.METRICS_TOKEN, // string | undefined

  // Auth
  jwtSecret:
    process.env.JWT_SECRET ||
    envsafe.JWT_SECRET ||
    (env !== "production" ? "dev-secret" : undefined),
  jwtExpire: process.env.JWT_EXPIRE || envsafe.JWT_EXPIRE || "7d",
};

module.exports = config;
