/**
 * Application Server
 * ------------------
 * Express app bootstrap: middleware, database connection, Socket.IO,
 * and route mounting. Exposes start/stop helpers for controlled lifecycle.
 *
 * Pseudocode
 * ----------
 * load env -> init express + http + socket.io
 * apply security middleware (helmet, compression), rate limit, CORS, parsers, logging
 * connectDB(): mongoose.connect
 * io handlers: join_user_room(userId), join_vendor_room(vendorId)
 * attach io to req for downstream emissions
 * health route -> returns status + env + db state
 * mount routes under /api/*
 * error handler -> 500; 404 handler -> not found
 * startServer(): await connectDB() -> server.listen
 * stopServer(): close mongoose + http server
 */
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const pino = require("pino");
const pinoHttp = require("pino-http");
const client = require("prom-client");
const { createServer } = require("http");
const { Server } = require("socket.io");
const config = require("./config/config");
const logger = require("./utils/logger");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const businessRoutes = require("./routes/businesses");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const vendorCustomerRoutes = require("./routes/vendor-customers");
// Test-only utilities
let testRoutes = null;
if (config.isTest) {
  try {
    testRoutes = require("./routes/test");
  } catch (_) {}
}

const ENV = config.env;
const isTest = config.isTest;
const isDev = config.isDev;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
    methods: ["GET", "POST"],
  },
});

const PORT = config.port;

// Security middleware
app.use(helmet());
// Enable gzip compression with a reasonable threshold; in tests it has negligible effect
app.use(compression({ threshold: config.compressionThreshold }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest, // skip limits during tests
});
app.use("/api/", limiter);

// CORS configuration
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
  })
);
// Preflight
app.options("*", cors());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Structured logging with Pino (pretty in dev, JSON in prod)
const baseLogger = pino(
  isDev
    ? {
        level: config.logLevel,
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            singleLine: true,
          },
        },
      }
    : { level: config.logLevel }
);
app.use(
  pinoHttp({
    logger: baseLogger,
    autoLogging: !isTest,
    customLogLevel: function (_req, res, err) {
      if (res.statusCode >= 500 || err) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  })
);

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || config.mongodbUri;
    await mongoose.connect(mongoUri);
    logger.info("✅ Connected to MongoDB");
  } catch (error) {
    logger.error({ err: error }, "❌ MongoDB connection error");
    process.exit(1);
  }
};

// Socket.IO for real-time notifications
io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "👤 User connected");

  // Join user-specific room
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    logger.info({ userId }, "User joined room");
  });

  // Join vendor-specific room
  socket.on("join_vendor_room", (vendorId) => {
    socket.join(`vendor_${vendorId}`);
    logger.info({ vendorId }, "Vendor joined room");
  });

  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, "👤 User disconnected");
  });
});

// Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get("/health", (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: ENV,
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    uptimeSec: process.uptime(),
    memory: {
      rss: mem.rss,
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      external: mem.external,
    },
  });
});

// Readiness probe: lightweight liveness to check DB and server state
app.get("/ready", (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  const listening = server.listening === true;
  if (dbReady && listening) return res.status(200).json({ status: "READY" });
  return res.status(503).json({ status: "NOT_READY", dbReady, listening });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/vendor-customers", vendorCustomerRoutes);
// Mount test utilities routes only in test environment
if (isTest && testRoutes) {
  app.use("/api/test", testRoutes);
}

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error({ err, stack: err.stack }, "Unhandled error middleware");
  res.status(500).json({
    message: "Something went wrong!",
    error: isDev ? err.message : "Internal server error",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
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

// Graceful shutdown helper for tests
const stopServer = async () => {
  try {
    await mongoose.connection.close();
  } catch {}
  return new Promise((resolve) => server.close(() => resolve()));
};

if (!isTest) {
  startServer();
}

module.exports = { app, io, startServer, connectDB, stopServer, server };

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

// Prometheus metrics (non-production)
if (config.enableMetrics) {
  client.collectDefaultMetrics({ prefix: "sba_backend_" });
  app.get("/metrics", async (req, res) => {
    try {
      res.set("Content-Type", client.register.contentType);
      res.end(await client.register.metrics());
    } catch (e) {
      res.status(500).send(e.message);
    }
  });
}
