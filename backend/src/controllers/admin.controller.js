/**
 * Admin Controller
 * ----------------
 * Admin stats, list users, and toggle user activation.
 */
const User = require("../models/user.model");
const Business = require("../models/business.model");
const Order = require("../models/order.model");

exports.stats = async (_req, res) => {
  try {
    const [users, vendors, businesses, orders] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "vendor" }),
      Business.countDocuments(),
      Order.countDocuments(),
    ]);
    return res.json({
      success: true,
      data: { users, vendors, businesses, orders },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error getting admin stats" });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    return res.json({
      success: true,
      data: {
        users: items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("Admin list users error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error listing users" });
  }
};

exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    return res.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"}`,
      data: { user },
    });
  } catch (error) {
    console.error("Admin toggle user error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error updating user" });
  }
};
