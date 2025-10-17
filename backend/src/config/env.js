"use strict";

// Centralized environment validation using envalid
const { cleanEnv, str, num, bool } = require("envalid");
require("dotenv").config();

const env = cleanEnv(process.env, {
  NODE_ENV: str({ devDefault: "development" }),

  // Server
  PORT: num({ devDefault: 3000 }),
  FRONTEND_URL: str({ devDefault: "http://localhost:3000" }),

  // Database
  MONGODB_URI: str({
    devDefault: "mongodb://localhost:27017/smart-business-ai",
  }),

  // Auth
  JWT_SECRET: str({ devDefault: "dev-secret" }),
  JWT_EXPIRE: str({ devDefault: "7d" }),

  // Performance & security
  RATE_LIMIT_WINDOW_MS: num({ devDefault: 15 * 60 * 1000 }),
  RATE_LIMIT_MAX: num({ devDefault: 100 }),
  COMPRESSION_THRESHOLD: num({ devDefault: 1024 }),

  // Logging / Metrics
  LOG_LEVEL: str({ devDefault: "info" }),
  // In development, default to true; in production/test leave undefined unless explicitly set
  ENABLE_METRICS: str({ default: undefined, devDefault: "true" }),
  // Optional protection for /metrics
  METRICS_TOKEN: str({ default: undefined }),

  // Trust proxy configuration (e.g., "true" or a number like "1")
  TRUST_PROXY: str({ default: undefined }),
});

module.exports = env;
