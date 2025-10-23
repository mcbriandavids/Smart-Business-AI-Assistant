/**
 * Auth Middleware
 * ---------------
 * Provides request guards and utilities: protect (JWT), authorize (roles), optionalAuth,
 * resource ownership checks, rate limit builder, and API key validation.
 *
 * Pseudocode
 * ----------
 * protect():
 *   - read Bearer token -> verify -> load user -> attach to req -> continue or 401
 * authorize(...roles):
 *   - ensure req.user.role in roles else 403
 * optionalAuth():
 *   - try to decode token; if valid and active, attach req.user; never fail
 * checkOwnership(resourceType):
 *   - load resource (business/order) -> verify ownership or admin -> attach to req
 * createRateLimit(windowMs,max,msg):
 *   - return configured express-rate-limit instance
 * validateApiKey():
 *   - check x-api-key against allowed list -> next or 401
 */
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/user.model");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    try {
      // Verify token
<<<<<<< HEAD
      if (!config.jwtSecret) {
        return res
          .status(500)
          .json({ success: false, message: "Server configuration error" });
      }
=======
>>>>>>> frontend
      const decoded = jwt.verify(token, config.jwtSecret);

      // Get user from token
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is not valid. User not found.",
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User account is deactivated.",
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error in authentication middleware",
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. User not authenticated.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

// Optional authentication - doesn't fail if no token
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      try {
<<<<<<< HEAD
        if (!config.jwtSecret) {
          throw new Error("JWT secret missing");
        }
=======
>>>>>>> frontend
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(decoded.id).select("-password");

        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token invalid, but continue without user
        console.log("Invalid token in optional auth:", error.message);
      }
    }

    next();
  } catch (error) {
    next();
  }
};

// Check if user owns the resource
exports.checkOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      let resource;

      switch (resourceType) {
        case "business":
          const Business = require("../models/business.model");
          resource = await Business.findById(resourceId);
          if (!resource) {
            return res.status(404).json({
              success: false,
              message: "Business not found",
            });
          }
          if (
            resource.owner.toString() !== req.user.id &&
            req.user.role !== "admin"
          ) {
            return res.status(403).json({
              success: false,
              message: "Access denied. You do not own this business.",
            });
          }
          req.business = resource;
          break;

        case "order":
          const Order = require("../models/order.model");
          resource = await Order.findById(resourceId).populate("business");
          if (!resource) {
            return res.status(404).json({
              success: false,
              message: "Order not found",
            });
          }

          const isCustomer = resource.customer.toString() === req.user.id;
          const isVendor = resource.business.owner.toString() === req.user.id;
          const isAdmin = req.user.role === "admin";

          if (!isCustomer && !isVendor && !isAdmin) {
            return res.status(403).json({
              success: false,
              message:
                "Access denied. You are not authorized to access this order.",
            });
          }
          req.order = resource;
          break;

        default:
          return res.status(400).json({
            success: false,
            message: "Invalid resource type for ownership check",
          });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error in ownership check",
      });
    }
  };
};

// Rate limiting for specific endpoints
exports.createRateLimit = (windowMs, max, message) => {
  const rateLimit = require("express-rate-limit");

  // In test environment, disable rate limiting to avoid flakiness
  if (process.env.NODE_ENV === "test") {
    return (_req, _res, next) => next();
  }

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Validate API key for external integrations
exports.validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key is required",
    });
  }

  // In production, store API keys in database with proper encryption
  const validApiKeys = [
    process.env.INTERNAL_API_KEY,
    // Add more API keys as needed
  ].filter(Boolean);

  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      message: "Invalid API key",
    });
  }

  next();
};
