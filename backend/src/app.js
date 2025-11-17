const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const pino = require("pino");
const pinoHttp = require("pino-http");
const client = require("prom-client");
const mongoose = require("mongoose");
const config = require("./config/config");

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const businessRoutes = require("./routes/businesses");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const vendorCustomerRoutes = require("./routes/vendor-customers");

let testRoutes = null;
if (config.isTest) {
  try {
    testRoutes = require("./routes/test");
  } catch (_) {}
}

function createApp() {
  const ENV = config.env;
  const isTest = config.isTest;
  const isDev = config.isDev;

  const app = express();

  // Respect proxy headers if running behind a reverse proxy (e.g., Nginx, load balancer)
  if (config.trustProxy) {
    const val = config.trustProxy === "true" ? 1 : config.trustProxy;
    app.set("trust proxy", val);
  }

  // Security middleware
  app.use(helmet());
  // Compression
  app.use(compression({ threshold: config.compressionThreshold }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTest,
  });
  app.use("/api/", limiter);

  // CORS with allowlist support
  const allowlist = new Set([
    config.frontendUrl,
    ...(config.frontendUrls || []),
  ]);
  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow non-browser clients (no origin) and allowed origins
        if (!origin || allowlist.has(origin)) return callback(null, true);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
      },
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
  app.options("*", cors());

  // Body parsers
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // HTTP logging via Pino
  const baseLogger = pino(
    isDev
      ? {
          level: config.logLevel,
          redact: [
            "req.headers.authorization",
            "req.headers.cookie",
            "res.headers['set-cookie']",
            "req.body.password",
            "req.body.confirmPassword",
          ],
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              singleLine: true,
            },
          },
        }
      : {
          level: config.logLevel,
          redact: [
            "req.headers.authorization",
            "req.headers.cookie",
            "res.headers['set-cookie']",
            "req.body.password",
            "req.body.confirmPassword",
          ],
        }
  );
  app.use(
    pinoHttp({
      logger: baseLogger,
      autoLogging: !isTest,
      genReqId: (req, res) =>
        req.headers["x-request-id"] ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      customLogLevel: function (_req, res, err) {
        if (res.statusCode >= 500 || err) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
    })
  );

  // Health
  app.get("/health", (_req, res) => {
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

  // Readiness
  // Note: server listening flag is added in start module; here we just expose DB state
  app.get("/ready", (_req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    if (dbReady) return res.status(200).json({ status: "READY", dbReady });
    return res.status(503).json({ status: "NOT_READY", dbReady });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/businesses", businessRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/vendors", require("./routes/vendor"));
  app.use("/api/vendor-customers", vendorCustomerRoutes);
  app.use("/api/customers", require("./routes/customers"));
  app.use("/api/ai", require("./routes/ai"));
  if (isTest && testRoutes) {
    app.use("/api/test", testRoutes);
  }

  // Error handler
  app.use((err, req, res, _next) => {
    const status = err.status || 500;
    const id = req.id || req.headers["x-request-id"] || "n/a";
    res.status(status).json({
      message: err.publicMessage || "Something went wrong!",
      requestId: id,
      ...(isDev ? { error: err.message, stack: err.stack } : {}),
    });
  });

  // 404
  app.use("*", (_req, res) =>
    res.status(404).json({ message: "Route not found" })
  );

  // Metrics (non-prod unless explicitly enabled, and not in test)
  if (config.enableMetrics && !config.isTest) {
    client.collectDefaultMetrics({ prefix: "sba_backend_" });
    app.get("/metrics", async (req, res) => {
      // Optional token guard to avoid exposing metrics publicly
      if (config.metricsToken) {
        const auth = req.headers["authorization"] || "";
        const token = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
        if (token !== config.metricsToken) {
          return res.status(401).json({ message: "Unauthorized" });
        }
      }
      try {
        res.set("Content-Type", client.register.contentType);
        res.end(await client.register.metrics());
      } catch (e) {
        res.status(500).send(e.message);
      }
    });
  }

  return app;
}

module.exports = { createApp };
