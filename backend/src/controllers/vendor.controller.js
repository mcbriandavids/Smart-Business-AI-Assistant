/**
 * Vendor Controller
 * ----------------
 * Admin: List all vendors
 */
const User = require("../models/user.model");

exports.listVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find({ role: "vendor" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: "vendor" }),
    ]);
    return res.json({
      success: true,
      data: {
        vendors: items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("Admin list vendors error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error listing vendors" });
  }
};
