const mongoose = require("mongoose");
const config = require("./config/config");
const logger = require("./utils/logger");

// Default connection behavior and retry policy (can be overridden via env)
const DEFAULT_MAX_RETRIES = Number(process.env.DB_MAX_RETRIES || 3);
const DEFAULT_RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS || 1000);

// Reasonable Mongoose/Mongo driver options for API servers
const CONNECTION_OPTIONS = {
  // Avoid auto index building in production; indexes should be created via migrations
  autoIndex: config.isDev,
  maxPoolSize: Number(process.env.DB_MAX_POOL || 10),
  minPoolSize: Number(process.env.DB_MIN_POOL || 0),
  serverSelectionTimeoutMS: Number(process.env.DB_SELECT_TIMEOUT_MS || 10000),
  socketTimeoutMS: Number(process.env.DB_SOCKET_TIMEOUT_MS || 45000),
};

let listenersAttached = false;
function attachConnectionEventLogging() {
  if (listenersAttached) return;
  listenersAttached = true;
  const conn = mongoose.connection;
  conn.on("connecting", () => logger.info("🧩 MongoDB connecting"));
  conn.on("connected", () => logger.info("✅ MongoDB connected"));
  conn.on("reconnected", () => logger.warn("♻️  MongoDB reconnected"));
  conn.on("disconnecting", () => logger.warn("🔌 MongoDB disconnecting"));
  conn.on("disconnected", () => logger.warn("❗ MongoDB disconnected"));
  conn.on("close", () => logger.warn("🔒 MongoDB connection closed"));
  conn.on("error", (err) =>
    logger.error({ err }, "❌ MongoDB connection error (event)")
  );
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function readyStateName() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  switch (mongoose.connection.readyState) {
    case 0:
      return "disconnected";
    case 1:
      return "connected";
    case 2:
      return "connecting";
    case 3:
      return "disconnecting";
    default:
      return "unknown";
  }
}

let memoryServer = null;

async function connectDB({
  uri,
  maxRetries = DEFAULT_MAX_RETRIES,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  options = {},
} = {}) {
  let mongoUri = uri || process.env.MONGODB_URI || config.mongodbUri;

  // Optional in-memory Mongo for local dev without Docker
  if (process.env.DB_USE_MEMORY === "true") {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
      logger.warn(
        { uri: memoryServer.getUri() },
        "⚠️ Using in-memory MongoDB (mongodb-memory-server)"
      );
    }
    mongoUri = memoryServer.getUri();
  }

  // Optional debug logs in dev
  if (config.isDev && process.env.MONGOOSE_DEBUG === "true") {
    mongoose.set("debug", true);
  }
  attachConnectionEventLogging();

  let attempt = 0;
  // Simple exponential backoff with cap
  while (true) {
    try {
      attempt += 1;
      await mongoose.connect(mongoUri, { ...CONNECTION_OPTIONS, ...options });
      logger.info({ uri: mongoUri, attempt }, "✅ Connected to MongoDB");
      return mongoose.connection;
    } catch (error) {
      logger.error({ err: error, attempt }, "❌ MongoDB connection failed");
      if (attempt >= maxRetries || config.isTest) {
        // In tests, don't keep retrying endlessly; surface the error
        if (!config.isTest) {
          logger.error({ maxRetries }, "Exceeded DB max retries; exiting");
          process.exit(1);
        }
        throw error;
      }
      const backoff = Math.min(retryDelayMs * Math.pow(2, attempt - 1), 10000);
      await sleep(backoff);
    }
  }
}

async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
  } catch (err) {
    logger.warn({ err }, "Error while disconnecting MongoDB (ignored)");
  }
}

async function waitForDbReady(timeoutMs = 10000) {
  if (mongoose.connection.readyState === 1) return; // already connected
  let timeout;
  return new Promise((resolve, reject) => {
    const onConnected = () => {
      clearTimeout(timeout);
      mongoose.connection.off("connected", onConnected);
      resolve();
    };
    mongoose.connection.on("connected", onConnected);
    timeout = setTimeout(() => {
      mongoose.connection.off("connected", onConnected);
      reject(new Error("Timed out waiting for MongoDB to be ready"));
    }, timeoutMs);
  });
}

module.exports = { connectDB, disconnectDB, readyStateName, waitForDbReady };
