/**
 * Orders Controller
 * -----------------
 * Contains request handlers for Orders domain.
 */

const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Business = require("../models/business.model");
const {
  createFromTemplate,
  createInApp,
} = require("../services/notificationService");
const logger = require("../utils/logger");

function calcItemSubtotal(unitPrice, quantity, variants = []) {
  const modifiers = variants.reduce(
    (sum, v) => sum + (v.priceModifier || 0),
    0
  );
  return (unitPrice + modifiers) * quantity;
}

exports.createOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      business: businessId,
      items,
      deliveryInfo,
      paymentInfo,
      customerNotes,
    } = req.body;

    const business = await Business.findById(businessId);
    if (!business || !business.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or inactive business" });
    }

    const productIds = items.map((i) => i.product);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    let subtotal = 0;
    const normalizedItems = [];
    for (const i of items) {
      const p = productMap.get(String(i.product));
      if (!p)
        return res
          .status(400)
          .json({ success: false, message: "Invalid product in items" });
      const unitPrice =
        p.price.sale && p.price.sale < p.price.regular
          ? p.price.sale
          : p.price.regular;
      const lineSubtotal = calcItemSubtotal(
        unitPrice,
        i.quantity || 1,
        i.variants || []
      );
      subtotal += lineSubtotal;
      normalizedItems.push({
        product: p._id,
        name: p.name,
        quantity: i.quantity || 1,
        unitPrice,
        variants: i.variants || [],
        notes: i.notes,
        subtotal: lineSubtotal,
      });
    }

    const servicePercentage = parseFloat(
      process.env.SERVICE_CHARGE_PERCENTAGE || "0"
    );
    const serviceCharge =
      Math.round(
        subtotal *
          (isNaN(servicePercentage) ? 0 : servicePercentage / 100) *
          100
      ) / 100;
    const deliveryFee =
      deliveryInfo?.type === "delivery"
        ? Number(deliveryInfo?.deliveryFee || 0)
        : 0;
    const tax = 0;
    const discount = 0;
    const total = subtotal + serviceCharge + deliveryFee + tax - discount;

    const payment = {
      method: paymentInfo?.method || "cash",
      status: paymentInfo?.status || "pending",
      transactionId: paymentInfo?.transactionId,
    };

    const order = await Order.create({
      customer: customerId,
      business: businessId,
      items: normalizedItems,
      deliveryInfo,
      paymentInfo: payment,
      pricing: { subtotal, serviceCharge, deliveryFee, tax, discount, total },
      status: "pending",
      customerNotes,
    });

    // Notify vendor
    try {
      await createInApp(
        {
          recipient: String(business.owner),
          sender: customerId,
          type: "order_created",
          title: "New Order",
          message: `Order ${order._id} created`,
          data: { orderId: order._id },
        },
        req.io,
        `vendor_${business.owner}`,
        "order_created"
      );
    } catch (_) {}

    return res.status(201).json({ success: true, data: { order } });
  } catch (error) {
    logger.error({ err: error }, "Create order error");
    return res
      .status(500)
      .json({ success: false, message: "Server error creating order" });
  }
};

// List orders for current user (customer/vendor) or all (admin)
exports.listOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let filter = {};
    if (req.user.role === "customer") {
      filter.customer = req.user.id;
    } else if (req.user.role === "vendor") {
      // find business owned by vendor
      const business = await Business.findOne({ owner: req.user.id });
      if (!business) {
        return res.json({
          success: true,
          data: { items: [], pagination: { page, limit, total: 0, pages: 0 } },
        });
      }
      filter.business = business._id;
    } // admin sees all

    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return res.json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (e) {
    logger.error({ err: e }, "List orders error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    return res.json({ success: true, data: { order } });
  } catch (e) {
    logger.error({ err: e }, "Get order error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Alias for route name
exports.getOrderById = exports.getOrder;

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("business");
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner =
      order.business && String(order.business.owner) === req.user.id;
    if (!isAdmin && !isOwner)
      return res.status(403).json({ success: false, message: "Access denied" });

    const { status } = req.body;
    order.status = status;
    await order.save();

    return res.json({ success: true, data: { order } });
  } catch (e) {
    logger.error({ err: e }, "Update order status error");
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
