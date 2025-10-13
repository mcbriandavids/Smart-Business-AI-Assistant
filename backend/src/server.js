const { createServer } = require("http");
const config = require("./config/config");
const logger = require("./utils/logger");
const { createApp } = require("./app");
const { connectDB, disconnectDB } = require("./db");
const { attachSocket } = require("./socket");

const ENV = config.env;
const isTest = config.isTest;
const PORT = config.port;

const app = createApp();
const server = createServer(app);
const io = attachSocket(server);

// Expose io to routes via middleware
app.use((req, _res, next) => {
  req.io = io;
  next();
});

const startServer = async () => {
  await connectDB();
  return new Promise((resolve) => {
    const listener = server.listen(PORT, () => {
      logger.info({ port: PORT }, "🚀 Server running");
      logger.info({ env: ENV }, "🌐 Environment");
      logger.info("📡 Socket.IO enabled for real-time features");
      resolve(listener);
    });
  });
};

const stopServer = async () => {
  await disconnectDB();
  return new Promise((resolve) => server.close(() => resolve()));
};

if (!isTest) {
  startServer();
}

module.exports = { app, io, startServer, stopServer, server };

// Global error safety nets and graceful shutdown (not used during tests)
if (!isTest) {
  process.on("unhandledRejection", (reason) => {
    logger.error({ err: reason }, "Unhandled Rejection");
  });
  process.on("uncaughtException", (err) => {
    logger.error({ err }, "Uncaught Exception");
  });
  const shutdown = async (signal) => {
    try {
      logger.warn({ signal }, "Shutting down gracefully...");
      await stopServer();
      process.exit(0);
    } catch (e) {
      logger.error({ err: e }, "Error during shutdown");
      process.exit(1);
    }
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}
