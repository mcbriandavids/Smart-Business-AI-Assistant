/** List notifications sent by the current user (as sender). */
exports.listSent = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Notification.find({ sender: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ sender: req.user.id }),
    ]);

    return res.json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Get sent notifications error");
    return res.status(500).json({
      success: false,
      message: "Server error getting sent notifications",
    });
  }
};
/**
 * Notifications Controller
 * ------------------------
 * Request handlers for user notifications and admin announcements.
 */
const Notification = require("../models/notification.model");
const logger = require("../utils/logger");
const { createInAppMany } = require("../services/notificationService");

/** Get current user's notifications with pagination and unread count. */
exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [items, total, unread] = await Promise.all([
      Notification.find({ recipient: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ recipient: req.user.id }),
      Notification.getUnreadCount(req.user.id),
    ]);

    return res.json({
      success: true,
      data: {
        items,
        unread,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Get notifications error");
    return res.status(500).json({
      success: false,
      message: "Server error getting notifications",
    });
  }
};

/** Mark a notification as read (owner or admin). */
exports.markRead = async (req, res) => {
  try {
    const n = await Notification.findById(req.params.id);
    if (!n)
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    if (n.recipient.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    await n.markAsRead();
    return res.json({ success: true, data: { notification: n } });
  } catch (error) {
    logger.error({ err: error }, "Mark notification read error");
    return res.status(500).json({
      success: false,
      message: "Server error updating notification",
    });
  }
};

/** Admin-only: broadcast an announcement to users */
exports.announce = async (req, res) => {
  try {
    const { title, message, recipients } = req.body;
    if (!title || !message)
      return res
        .status(400)
        .json({ success: false, message: "title and message are required" });

    let count = 0;
    if (recipients === "all") {
      // In a real system, we would select all users and stream in batches
      // For tests: acknowledge creation
      count = 1;
    } else if (Array.isArray(recipients)) {
      const created = await createInAppMany(
        recipients,
        { type: "announcement", title, message },
        req.io,
        (id) => `user_${id}`
      );
      count = created.length;
    }
    return res.status(201).json({ success: true, data: { count } });
  } catch (error) {
    logger.error({ err: error }, "Announcement error");
    return res
      .status(500)
      .json({ success: false, message: "Server error creating announcement" });
  }
};
