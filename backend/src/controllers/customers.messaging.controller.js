/**
 * Customer Messaging Controller
 * ----------------------------
 * Handles sending messages to customers.
 */
const Customer = require("../models/customer.model");

// Send a message to a customer (must belong to vendor)
exports.sendMessage = async (req, res) => {
  try {
    const vendor = req.user._id;
    const { content, type, channel = "in_app" } = req.body;
    const customer = await Customer.findOne({ _id: req.params.id, vendor });
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    customer.messages.push({ content, type, channel });
    customer.lastInteractionAt = new Date();
    await customer.save();
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
