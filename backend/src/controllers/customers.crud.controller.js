/**
 * Customer CRUD Controller
 * -----------------------
 * Handles create, read, update, delete for vendor's customers.
 */
const Customer = require("../models/customer.model");

// Create a new customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone, notes } = req.body;
    const vendor = req.user._id;
    // Create the customer
    const customer = await Customer.create({
      vendor,
      name,
      email,
      phone,
      notes,
    });

    // Also create a VendorCustomer entry for broadcast/consent management
    const VendorCustomer = require("../models/vendor-customer.model");
    await VendorCustomer.create({
      vendor,
      customer: customer._id,
      contact: {
        name,
        email,
        phone,
      },
      consentToContact: true,
    });

    res.status(201).json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all customers for the logged-in vendor
exports.getCustomers = async (req, res) => {
  try {
    const vendor = req.user._id;
    const customers = await Customer.find({ vendor });
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get a single customer by ID (must belong to vendor)
exports.getCustomer = async (req, res) => {
  try {
    const vendor = req.user._id;
    const customer = await Customer.findOne({ _id: req.params.id, vendor });
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a customer (must belong to vendor)
exports.updateCustomer = async (req, res) => {
  try {
    const vendor = req.user._id;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, vendor },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete a customer (must belong to vendor)
exports.deleteCustomer = async (req, res) => {
  try {
    const vendor = req.user._id;
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      vendor,
    });
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
