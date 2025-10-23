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
  return ["http://localhost:5173", "http://localhost:3000"];
})();

const config = {
  env,
  isDev,
  isTest,
  isProd,

  // Server
<<<<<<< HEAD
  port: Number(envsafe.PORT || process.env.PORT || 3000),
  frontendUrl:
    envsafe.FRONTEND_URL || process.env.FRONTEND_URL || "http://localhost:3000",
=======
  port: Number(process.env.PORT || 3000),
  // Keep single URL for backward compatibility, default to Vite dev port
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  // Allowlist of acceptable frontend origins (used by app-level CORS)
  frontendUrls,
>>>>>>> frontend

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
<<<<<<< HEAD
  // Default: enable metrics in non-production unless explicitly disabled; disabled in production unless explicitly enabled
  enableMetrics: (() => {
    const raw = envsafe.ENABLE_METRICS ?? process.env.ENABLE_METRICS;
    if (typeof raw === "string") return raw === "true";
    return env !== "production"; // default behavior
  })(),

  // Security/Infra
  trustProxy: envsafe.TRUST_PROXY ?? process.env.TRUST_PROXY, // string | undefined
  metricsToken: envsafe.METRICS_TOKEN ?? process.env.METRICS_TOKEN, // string | undefined

  // Auth
  jwtSecret:
    envsafe.JWT_SECRET ||
    process.env.JWT_SECRET ||
    (env !== "production" ? "dev-secret" : undefined),
  jwtExpire: envsafe.JWT_EXPIRE || process.env.JWT_EXPIRE || "7d",
=======
  enableMetrics: process.env.ENABLE_METRICS
    ? process.env.ENABLE_METRICS === "true"
    : env !== "production",

  // Auth
  // Provide safe defaults in non-production so tests and local dev work out of the box
  jwtSecret:
    process.env.JWT_SECRET || (env !== "production" ? "dev-secret" : undefined),
  jwtExpire: process.env.JWT_EXPIRE || "7d",
>>>>>>> frontend
};

module.exports = config;
