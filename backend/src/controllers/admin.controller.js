/**
 * Admin Controller
 * ----------------
 * Admin stats, list users, and toggle user activation.
 */
const User = require("../models/user.model");
const Business = require("../models/business.model");
const Order = require("../models/order.model");
const AgentConversation = require("../models/agent-conversation.model");

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

exports.listConversationFeedback = async (req, res) => {
  try {
    const {
      status,
      flagStatus,
      minRating,
      maxRating,
      q,
      vendorId,
      page = 1,
      limit = 20,
    } = req.query;

    const parsedPage = parseInt(page, 10);
    const safePage = Number.isFinite(parsedPage) ? Math.max(parsedPage, 1) : 1;

    const parsedLimit = parseInt(limit, 10);
    const safeLimit = Number.isFinite(parsedLimit)
      ? Math.min(Math.max(parsedLimit, 1), 100)
      : 20;

    const skip = (safePage - 1) * safeLimit;

    const query = {};

    if (status && ["active", "closed", "archived"].includes(status)) {
      query.status = status;
    }

    if (vendorId) {
      query.vendor = vendorId;
    }

    if (flagStatus && flagStatus !== "none") {
      query["qaFlags.status"] = flagStatus;
    }

    if (minRating || maxRating) {
      query["rating.average"] = {};
      const minValue = Number(minRating);
      const maxValue = Number(maxRating);
      if (Number.isFinite(minValue)) {
        query["rating.average"].$gte = minValue;
      }
      if (Number.isFinite(maxValue)) {
        query["rating.average"].$lte = maxValue;
      }
      if (Object.keys(query["rating.average"]).length === 0) {
        delete query["rating.average"];
      }
    }

    let searchFilter = null;
    if (q && typeof q === "string" && q.trim()) {
      try {
        searchFilter = new RegExp(q.trim(), "i");
        query["feedbackEntries.comment"] = searchFilter;
      } catch (_err) {
        // Ignore regex errors and skip search filter
      }
    }

    const [items, total] = await Promise.all([
      AgentConversation.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .select(
          "vendor customer rating feedbackEntries qaFlags status updatedAt summary"
        )
        .populate({ path: "vendor", select: "firstName lastName email" })
        .populate({ path: "customer", select: "name email phone" })
        .lean(),
      AgentConversation.countDocuments(query),
    ]);

    const conversations = items.map((conversation) => {
      const feedbackEntries = Array.isArray(conversation.feedbackEntries)
        ? conversation.feedbackEntries.slice(-5)
        : [];
      const qaFlags = Array.isArray(conversation.qaFlags)
        ? conversation.qaFlags
        : [];

      return {
        id: conversation._id?.toString?.() || conversation._id,
        status: conversation.status,
        summary: conversation.summary || null,
        updatedAt: conversation.updatedAt,
        rating: conversation.rating || null,
        feedbackEntries,
        qaFlags,
        vendor: conversation.vendor
          ? {
              id:
                conversation.vendor._id?.toString?.() ||
                conversation.vendor._id,
              name:
                [conversation.vendor.firstName, conversation.vendor.lastName]
                  .filter(Boolean)
                  .join(" ") || null,
              email: conversation.vendor.email,
            }
          : null,
        customer: conversation.customer
          ? {
              id:
                conversation.customer._id?.toString?.() ||
                conversation.customer._id,
              name: conversation.customer.name || null,
              email: conversation.customer.email,
              phone: conversation.customer.phone,
            }
          : null,
      };
    });

    return res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          pages: Math.ceil(total / safeLimit) || 1,
        },
      },
    });
  } catch (error) {
    console.error("Admin listConversationFeedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error loading conversation feedback",
    });
  }
};

exports.updateQaFlag = async (req, res) => {
  try {
    const { conversationId, flagId } = req.params;
    const { status, notes } = req.body;

    const conversation = await AgentConversation.findById(conversationId);
    if (!conversation) {
      return res
        .status(404)
        .json({ success: false, message: "Conversation not found" });
    }

    const flag = conversation.qaFlags.id(flagId);
    if (!flag) {
      return res
        .status(404)
        .json({ success: false, message: "QA flag not found" });
    }

    if (status) {
      flag.status = status;
      if (status === "resolved" || status === "dismissed") {
        flag.resolvedAt = new Date();
        flag.resolvedBy = req.user._id;
      } else {
        flag.resolvedAt = null;
        flag.resolvedBy = null;
      }
    }

    if (typeof notes === "string") {
      flag.notes = notes.trim();
    }

    await conversation.save();

    return res.json({
      success: true,
      data: {
        flag,
      },
    });
  } catch (error) {
    console.error("Admin updateQaFlag error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating QA flag",
    });
  }
};
