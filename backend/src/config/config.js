// Centralized configuration loader
// Loads environment variables once and provides typed, defaulted values

require("dotenv").config();
const envsafe = require("./env");

const env = envsafe.NODE_ENV || process.env.NODE_ENV || "development";
const isDev = env === "development";
const isTest = env === "test";
const isProd = env === "production";

const config = {
  env,
  isDev,
  isTest,
  isProd,

  // Server
  port: Number(envsafe.PORT || process.env.PORT || 3000),
  frontendUrl:
    envsafe.FRONTEND_URL || process.env.FRONTEND_URL || "http://localhost:3000",

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
};

module.exports = config;
