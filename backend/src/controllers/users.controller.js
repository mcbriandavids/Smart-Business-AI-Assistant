/**
 * Users Controller (kebab-case)
 * Admin-focused user management plus self/nearby utilities.
 */
const User = require("../models/user.model");
const Business = require("../models/business.model");

exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await User.countDocuments(query);

    return res.json({
      success: true,
      data: {
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error getting users" });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    let business = null;
    if (user.role === "vendor")
      business = await Business.findOne({ owner: user._id });

    return res.json({ success: true, data: { user, business } });
  } catch (error) {
    console.error("Get user error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error getting user" });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const {
      firstName,
      lastName,
      phone,
      address,
      preferences,
      isVerified,
      isActive,
      role,
    } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (req.user.role === "admin") {
      if (typeof isVerified === "boolean") user.isVerified = isVerified;
      if (typeof isActive === "boolean") user.isActive = isActive;
      if (role && ["customer", "vendor", "admin"].includes(role))
        user.role = role;
    }

    await user.save();
    return res.json({
      success: true,
      message: "User updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error updating user" });
  }
};

exports.remove = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.role === "vendor") {
      await Business.findOneAndDelete({ owner: user._id });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error deleting user" });
  }
};

exports.statsOverview = async (_req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const customers = await User.countDocuments({ role: "customer" });
    const vendors = await User.countDocuments({ role: "vendor" });
    const admins = await User.countDocuments({ role: "admin" });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const activeUsers = await User.countDocuments({ isActive: true });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const registrationStats = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    return res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          customers,
          vendors,
          admins,
          verifiedUsers,
          activeUsers,
        },
        registrationStats,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error getting user statistics",
    });
  }
};

exports.toggleVerify = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    user.isVerified = !user.isVerified;
    await user.save();
    return res.json({
      success: true,
      message: `User ${
        user.isVerified ? "verified" : "unverified"
      } successfully`,
      data: { user },
    });
  } catch (error) {
    console.error("Toggle verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating verification status",
    });
  }
};

exports.toggleActive = async (req, res) => {
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
      message: `User ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      data: { user },
    });
  } catch (error) {
    console.error("Toggle active status error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error updating active status" });
  }
};

exports.nearby = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "Please provide longitude and latitude",
      });
    }
    const users = await User.find({
      "address.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      isActive: true,
      _id: { $ne: req.user.id },
    }).select("-password");
    return res.json({ success: true, data: { users } });
  } catch (error) {
    console.error("Get nearby users error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error getting nearby users" });
  }
};
