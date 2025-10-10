/**
 * Logger
 * ------
 * Pino-based logger configured to print pretty logs in development
 * and JSON logs in production. Use across controllers/services instead
 * of console.log/console.error for consistent output.
 */
const pino = require("pino");
const config = require("../config/config");
const isDev = config.isDev;
const level = config.logLevel;

const logger = isDev
  ? pino({
      level,
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          singleLine: true,
        },
      },
    })
  : pino({ level });

module.exports = logger;
