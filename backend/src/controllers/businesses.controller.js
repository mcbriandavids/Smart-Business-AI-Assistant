const Order = require("../models/order.model");
const User = require("../models/user.model");

// Get customers for a business sorted by patronage (total spent, order count)
exports.getCustomersByPatronage = async (req, res) => {
  try {
    // Find business by owner (current user)
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    }
    // Aggregate orders for this business, group by customer
    const pipeline = [
      { $match: { business: business._id } },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: "$customer",
          totalSpent: { $sum: "$pricing.total" },
          orderCount: { $sum: 1 },
          lastOrder: { $max: "$createdAt" },
          latestOrderStatus: { $first: "$status" },
        },
      },
      { $sort: { totalSpent: -1, orderCount: -1, lastOrder: -1 } },
      { $limit: 100 },
    ];
    const customers = await Order.aggregate(pipeline);
    // Populate customer details
    const populated = await User.find({
      _id: { $in: customers.map((c) => c._id) },
    }).select("firstName lastName email phone avatar");
    // Map user details into result
    const result = customers.map((c) => {
      const user = populated.find(
        (u) => u._id.toString() === c._id?.toString()
      );
      return {
        customerId: c._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phone: user?.phone,
        avatar: user?.avatar,
        totalSpent: c.totalSpent,
        orderCount: c.orderCount,
        lastOrder: c.lastOrder,
        deliveryStatus: c.latestOrderStatus,
      };
    });
    return res.json({ success: true, data: { customers: result } });
  } catch (error) {
    logger.error({ err: error }, "Get customers by patronage error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// Get business content for owner
exports.getContent = async (req, res) => {
  try {
    // Find business by owner (current user)
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    }
    // Return only content fields (description, name, etc.)
    return res.json({
      success: true,
      data: {
        id: business._id,
        name: business.name,
        description: business.description,
        category: business.category,
        logo: business.logo,
        images: business.images,
        contact: business.contact,
        address: business.address,
        businessHours: business.businessHours,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Get business content error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update business content for owner
exports.updateContent = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    }
    const {
      name,
      description,
      category,
      logo,
      images,
      contact,
      address,
      businessHours,
    } = req.body;
    if (name) business.name = name;
    if (description) business.description = description;
    if (category) business.category = category;
    if (logo) business.logo = logo;
    if (images) business.images = images;
    if (contact) business.contact = { ...business.contact, ...contact };
    if (address) business.address = { ...business.address, ...address };
    if (businessHours)
      business.businessHours = { ...business.businessHours, ...businessHours };
    await business.save();
    return res.json({ success: true, data: { business } });
  } catch (error) {
    logger.error({ err: error }, "Update business content error");
    return res.status(500).json({
      success: false,
      message: "Server error updating business content",
    });
  }
};
const Business = require("../models/business.model");
const logger = require("../utils/logger");
/**
 * Businesses Controller
 * ---------------------
 * Business registration, listing with Haversine proximity, CRUD, categories, and status.
 */

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

exports.register = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      address,
      contact,
      businessHours,
      services,
      paymentMethods,
    } = req.body;

    const existingBusiness = await Business.findOne({ owner: req.user.id });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: "You already have a registered business",
      });
    }

    const business = await Business.create({
      owner: req.user.id,
      name,
      description,
      category,
      address,
      contact,
      businessHours,
      services,
      paymentMethods,
    });

    return res.status(201).json({
      success: true,
      message: "Business registered successfully",
      data: { business },
    });
  } catch (error) {
    logger.error({ err: error }, "Business registration error");
    return res.status(500).json({
      success: false,
      message: "Server error during business registration",
    });
  }
};

exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search;
    const latitude = req.query.latitude
      ? parseFloat(req.query.latitude)
      : undefined;
    const longitude = req.query.longitude
      ? parseFloat(req.query.longitude)
      : undefined;
    const maxDistanceKm = req.query.maxDistanceKm
      ? parseFloat(req.query.maxDistanceKm)
      : undefined;

    const query = { isActive: true };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
      ];
    }

    let items = await Business.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    if (
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      typeof maxDistanceKm === "number"
    ) {
      items = items.filter((b) => {
        const coords = b.address?.coordinates;
        if (
          !coords ||
          typeof coords.lat !== "number" ||
          typeof coords.lng !== "number"
        )
          return false;
        const dist = haversineKm(latitude, longitude, coords.lat, coords.lng);
        return dist <= maxDistanceKm;
      });
    }

    const total = await Business.countDocuments(query);
    return res.json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    logger.error({ err: error }, "List businesses error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business)
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    return res.json({ success: true, data: { business } });
  } catch (error) {
    logger.error({ err: error }, "Get business error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.categories = async (_req, res) => {
  const categories = ["restaurant", "retail", "services", "grocery", "other"];
  return res.json({ success: true, data: { categories } });
};

// Update a business (owner or admin)
exports.update = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business)
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner = String(business.owner) === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const {
      name,
      description,
      category,
      address,
      contact,
      businessHours,
      services,
      paymentMethods,
      isActive,
      isVerified,
    } = req.body;

    if (name) business.name = name;
    if (description) business.description = description;
    if (category) business.category = category;
    if (address) business.address = { ...business.address, ...address };
    if (contact) business.contact = { ...business.contact, ...contact };
    if (businessHours)
      business.businessHours = { ...business.businessHours, ...businessHours };
    if (services) business.services = { ...business.services, ...services };
    if (paymentMethods) business.paymentMethods = paymentMethods;
    if (typeof isActive === "boolean") business.isActive = isActive;
    if (isAdmin && typeof isVerified === "boolean")
      business.isVerified = isVerified;

    await business.save();
    return res.json({ success: true, data: { business } });
  } catch (error) {
    logger.error({ err: error }, "Update business error");
    return res
      .status(500)
      .json({ success: false, message: "Server error updating business" });
  }
};

// Delete a business (owner or admin)
exports.remove = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business)
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner = String(business.owner) === req.user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    await Business.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: "Business deleted successfully",
    });
  } catch (error) {
    logger.error({ err: error }, "Delete business error");
    return res
      .status(500)
      .json({ success: false, message: "Server error deleting business" });
  }
};

// Toggle verification (admin only)
exports.toggleVerify = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ success: false, message: "Access denied" });
    const business = await Business.findById(req.params.id);
    if (!business)
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    business.isVerified = !business.isVerified;
    await business.save();
    return res.json({ success: true, data: { business } });
  } catch (e) {
    logger.error({ err: e }, "Toggle verify business error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.status = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business)
      return res
        .status(404)
        .json({ success: false, message: "Business not found" });
    const now = new Date();
    const weekday = now
      .toLocaleDateString("en", { weekday: "long" })
      .toLowerCase();
    const todayHours = business.businessHours?.[weekday];
    let isOpen = false;
    if (todayHours && todayHours.open && todayHours.close) {
      const [oH, oM] = todayHours.open.split(":").map(Number);
      const [cH, cM] = todayHours.close.split(":").map(Number);
      const open = new Date(now);
      open.setHours(oH, oM, 0, 0);
      const close = new Date(now);
      close.setHours(cH, cM, 0, 0);
      isOpen = now >= open && now <= close;
    }
    return res.json({
      success: true,
      data: { isOpen, businessHours: business.businessHours || {} },
    });
  } catch (e) {
    logger.error({ err: e }, "Business status error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Nearby businesses using simple Haversine over stored lat/lng
exports.nearby = async (req, res) => {
  try {
    const longitude = parseFloat(req.params.longitude);
    const latitude = parseFloat(req.params.latitude);
    const maxDistanceKm = req.query.maxDistanceKm
      ? parseFloat(req.query.maxDistanceKm)
      : 5;
    const category = req.query.category;

    const query = { isActive: true };
    if (category) query.category = category;

    const items = await Business.find(query).sort({ createdAt: -1 }).limit(500);
    const results = [];
    for (const b of items) {
      const coords = b.address?.coordinates;
      if (
        !coords ||
        typeof coords.lat !== "number" ||
        typeof coords.lng !== "number"
      )
        continue;
      const dist = haversineKm(latitude, longitude, coords.lat, coords.lng);
      if (dist <= maxDistanceKm)
        results.push({ business: b, distanceKm: dist });
    }
    results.sort((a, b) => a.distanceKm - b.distanceKm);
    // Return in shape expected by tests: data.businesses is an array
    return res.json({
      success: true,
      data: {
        businesses: results.map((r) => r.business),
        count: results.length,
      },
    });
  } catch (e) {
    logger.error({ err: e }, "Nearby businesses error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
