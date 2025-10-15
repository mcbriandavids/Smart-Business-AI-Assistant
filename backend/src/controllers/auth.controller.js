/**
 * Auth Controller
 * ---------------
 * Handles registration, login, user info, profile update, password change, logout, and admin creation.
 */
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/user.model");
const Business = require("../models/business.model");

const generateToken = (id) => {
  if (!config.jwtSecret) {
    const err = new Error("JWT secret not configured");
    err.publicMessage = "Server configuration error";
    throw err;
  }
  return jwt.sign({ id }, config.jwtSecret, { expiresIn: config.jwtExpire });
};

/** Register a new user. */
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, address } =
      req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "User with this email or phone already exists",
      });

    const validRoles = ["customer", "vendor"]; // admin cannot self-register
    if (role && !validRoles.includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role specified" });
    }

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password,
      role: role || "customer",
      address,
    });

    const token = generateToken(user._id);
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
};

/** Login user and return token + profile (with vendor business if applicable). */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    if (!user.isActive)
      return res.status(401).json({
        success: false,
        message: "Account is deactivated. Please contact support.",
      });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    await user.updateLastLogin();
    const token = generateToken(user._id);

    let business = null;
    if (user.role === "vendor") {
      business = await Business.findOne({ owner: user._id });
    }

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin,
        },
        business,
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};

/** Get current user */
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Update profile */
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");
    return res.json({ success: true, data: { user } });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Change password */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select("+password");
    const valid = await user.comparePassword(currentPassword);
    if (!valid)
      return res
        .status(400)
        .json({ success: false, message: "Current password incorrect" });
    user.password = newPassword;
    await user.save();
    return res.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Logout */
exports.logout = async (_req, res) => {
  return res.json({ success: true, message: "Logged out" });
};

/** Admin-only: create admin user */
exports.createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already in use" });
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password,
      role: "admin",
      isVerified: true,
    });
    return res.status(201).json({ success: true, data: { user } });
  } catch (error) {
    console.error("Create admin error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error creating admin" });
  }
};
