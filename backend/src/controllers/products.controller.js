/**
 * Products Controller
 * -------------------
 * Catalog retrieval and vendor/admin product management.
 */
const Product = require("../models/product.model");
const Business = require("../models/business.model");
const logger = require("../utils/logger");

exports.create = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    let businessId = req.body.business;
    if (!isAdmin) {
      const business = await Business.findOne({ owner: userId });
      if (!business) {
        return res
          .status(400)
          .json({ success: false, message: "No business found for vendor" });
      }
      businessId = business._id;
    }

    const product = await Product.create({
      ...req.body,
      business: businessId,
    });

    return res.status(201).json({ success: true, data: { product } });
  } catch (error) {
    logger.error({ err: error }, "Create product error");
    return res
      .status(500)
      .json({ success: false, message: "Server error creating product" });
  }
};

exports.list = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const {
      business,
      category,
      search,
      minPrice,
      maxPrice,
      available,
      sort = "relevance",
      featured,
      tags,
    } = req.query;

    const query = { isActive: true };
    if (business) query.business = business;
    if (category) query.category = category;
    if (typeof available !== "undefined")
      query.available = available === "true";
    if (featured) query.featured = featured === "true";
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query["price.regular"] = {};
      if (minPrice) query["price.regular"].$gte = Number(minPrice);
      if (maxPrice) query["price.regular"].$lte = Number(maxPrice);
    }

    let cursor = Product.find(query).skip(skip).limit(limit);
    switch (sort) {
      case "price_asc":
        cursor = cursor.sort({ "price.regular": 1 });
        break;
      case "price_desc":
        cursor = cursor.sort({ "price.regular": -1 });
        break;
      case "newest":
        cursor = cursor.sort({ createdAt: -1 });
        break;
      default:
        break;
    }

    const [items, total] = await Promise.all([
      cursor,
      Product.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: {
        products: items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    logger.error({ err: error }, "List products error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    return res.json({ success: true, data: { product } });
  } catch (e) {
    logger.error({ err: e }, "Get product error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    return res.json({ success: true, data: { product } });
  } catch (e) {
    logger.error({ err: e }, "Update product error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    return res.json({ success: true, message: "Product deleted" });
  } catch (e) {
    logger.error({ err: e }, "Delete product error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.toggleActive = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    p.isActive = !p.isActive;
    await p.save();
    return res.json({ success: true, data: { product: p } });
  } catch (e) {
    logger.error({ err: e }, "Toggle product active error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
