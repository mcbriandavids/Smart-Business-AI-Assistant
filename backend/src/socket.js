const { Server } = require("socket.io");
const config = require("./config/config");
const logger = require("./utils/logger");

function attachSocket(server) {
  const io = new Server(server, {
    cors: { origin: config.frontendUrl, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "👤 User connected");

    socket.on("join_user_room", (userId) => {
      socket.join(`user_${userId}`);
      logger.info({ userId }, "User joined room");
    });

    socket.on("join_vendor_room", (vendorId) => {
      socket.join(`vendor_${vendorId}`);
      logger.info({ vendorId }, "Vendor joined room");
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "👤 User disconnected");
    });
  });

  return io;
}

module.exports = { attachSocket };
