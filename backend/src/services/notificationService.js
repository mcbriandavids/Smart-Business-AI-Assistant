/**
 * Notification Service
 * ---------------------
 * Centralizes creation of in-app notifications and optional Socket.IO emission.
 * This keeps controllers and routes thin and consistent.
 *
 * Pseudocode
 * ----------
 * createInApp({recipient,sender,type,title,message,data}, io?, room?, event?):
 *   - Notification.create({... inApp.sent=true })
 *   - if io && room -> io.to(room).emit(event, notif)
 *   - return notif
 * createFromTemplate(templateName, recipient, data, io?, room?, event?):
 *   - Notification.createFromTemplate(...)
 *   - if io && room -> emit
 *   - return notif
 */

const Notification = require("../models/notification.model");

/**
 * Create an in-app notification and optionally emit a socket event to a room.
 * @param {Object} params - Notification parameters
 * @param {string} params.recipient - User id receiving the notification
 * @param {string} [params.sender] - User id sending the notification
 * @param {string} params.type - Notification type string
 * @param {string} params.title - Title to display
 * @param {string} params.message - Message body (short)
 * @param {Object} [params.data] - Data payload (orderId, productId, etc.)
 * @param {import('socket.io').Server} [io] - Socket.IO instance
 * @param {string} [room] - Socket room to emit to (e.g., user_{id}, vendor_{id})
 * @param {string} [event="notification"] - Event name to emit
 * @returns {Promise<import('../models/notification.model')>} Created notification
 */
async function createInApp(
  { recipient, sender, type, title, message, data },
  io,
  room,
  event = "notification"
) {
  if (!recipient) throw new Error("recipient is required");
  if (!type) throw new Error("type is required");
  if (!title) throw new Error("title is required");
  if (!message) throw new Error("message is required");
  const notif = await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    data,
    channels: { inApp: { sent: true, sentAt: new Date() } },
    status: "sent",
  });

  try {
    if (io && room) {
      io.to(room).emit(event, notif);
    }
  } catch (_) {}

  return notif;
}

/**
 * Create from a predefined template in Notification model and optionally emit.
 */
async function createFromTemplate(
  templateName,
  recipient,
  data,
  io,
  room,
  event = "notification"
) {
  const notif = await Notification.createFromTemplate(
    templateName,
    recipient,
    data
  );
  try {
    if (io && room) io.to(room).emit(event, notif);
  } catch (_) {}
  return notif;
}

/**
 * Bulk create in-app notifications for many recipients efficiently.
 * Uses insertMany and optionally emits to per-recipient rooms.
 * @param {Array<string>} recipients - User IDs
 * @param {Object} payload - { sender?, type, title, message, data? }
 * @param {import('socket.io').Server} [io]
 * @param {(recipientId:string)=>string} [roomForRecipient] - maps id->room (e.g., id=>`user_${id}`)
 * @param {string} [event="notification"]
 * @returns {Promise<Array<import('../models/notification.model')>>}
 */
async function createInAppMany(
  recipients,
  { sender, type, title, message, data },
  io,
  roomForRecipient,
  event = "notification"
) {
  if (!Array.isArray(recipients) || recipients.length === 0) return [];
  if (!type) throw new Error("type is required");
  if (!title) throw new Error("title is required");
  if (!message) throw new Error("message is required");

  const docs = recipients.map((rid) => ({
    recipient: rid,
    sender,
    type,
    title,
    message,
    data,
    channels: { inApp: { sent: true, sentAt: new Date() } },
    status: "sent",
  }));

  const created = await Notification.insertMany(docs, { ordered: false });

  if (io && typeof roomForRecipient === "function") {
    try {
      created.forEach((n) => {
        const room = roomForRecipient(String(n.recipient));
        if (room) io.to(room).emit(event, n);
      });
    } catch (_) {}
  }
  return created;
}

module.exports = {
  createInApp,
  createFromTemplate,
  createInAppMany,
};
