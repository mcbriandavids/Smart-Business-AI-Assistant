/**
 * Vendor Customers Controller (kebab-case)
 * Manages vendor contact book and broadcast flows.
 */

const VendorCustomer = require("../../models/vendor-customer.model");
const { createInApp } = require("../../services/notificationService");

/** List contacts for a vendor (admin can pass vendorId). */
exports.list = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const vendorId = isAdmin ? req.query.vendorId : req.user.id;
    if (isAdmin && !vendorId)
      return res
        .status(400)
        .json({ success: false, message: "vendorId required for admin" });
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    const q = { vendor: vendorId };
    if (search) {
      q.$or = [
        { "contact.name": { $regex: search, $options: "i" } },
        { "contact.email": { $regex: search, $options: "i" } },
        { "contact.phone": { $regex: search, $options: "i" } },
        { tags: { $in: [search] } },
      ];
    }

    const [items, total] = await Promise.all([
      VendorCustomer.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
      VendorCustomer.countDocuments(q),
    ]);

    return res.json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (e) {
    console.error("List vendor customers error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Create or update a contact. */
exports.upsert = async (req, res) => {
  try {
    const vendor = req.user.role === "admin" ? req.body.vendorId : req.user.id;
    if (!vendor)
      return res
        .status(400)
        .json({ success: false, message: "vendorId is required" });
    const {
      id,
      contact,
      tags,
      notes,
      consentToContact = true,
      customer,
    } = req.body;

    let doc;
    if (id) {
      doc = await VendorCustomer.findOneAndUpdate(
        { _id: id, vendor },
        { contact, tags, notes, consentToContact, customer },
        { new: true }
      );
    } else {
      doc = await VendorCustomer.create({
        vendor,
        contact,
        tags,
        notes,
        consentToContact,
        customer,
      });
    }
    return res
      .status(id ? 200 : 201)
      .json({ success: true, data: { contact: doc } });
  } catch (e) {
    console.error("Upsert vendor customer error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Delete a contact. */
exports.remove = async (req, res) => {
  try {
    const vendor = req.user.role === "admin" ? req.query.vendorId : req.user.id;
    const del = await VendorCustomer.findOneAndDelete({
      _id: req.params.id,
      vendor,
    });
    if (!del)
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (e) {
    console.error("Delete vendor customer error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/** Broadcast in-app notifications to registered customers among contacts. */
exports.broadcast = async (req, res) => {
  try {
    const vendorId =
      req.user.role === "admin" ? req.body.vendorId : req.user.id;
    const {
      contactIds = [],
      title,
      message,
      product,
      price,
      deliveryOffer,
      deliveryFee,
    } = req.body;

    let targets;
    if (contactIds.length > 0) {
      targets = await VendorCustomer.find({
        _id: { $in: contactIds },
        vendor: vendorId,
        consentToContact: true,
      });
    } else {
      targets = await VendorCustomer.find({
        vendor: vendorId,
        consentToContact: true,
      }).limit(500);
    }

    // Filter to unique customers (registered users only)
    const uniqueCustomerIds = Array.from(
      new Set(
        targets.map((t) => t.customer && t.customer.toString()).filter(Boolean)
      )
    );
    let created = 0;
    for (const customerId of uniqueCustomerIds) {
      await createInApp(
        {
          recipient: customerId,
          sender: vendorId,
          type: "other",
          title,
          message,
          data: {
            productId: product,
            customData: {
              price,
              deliveryOffer,
              deliveryFee,
              // Optionally, you can include all vendorContactIds for this customer
              vendorContactIds: targets
                .filter(
                  (t) => t.customer && t.customer.toString() === customerId
                )
                .map((t) => t.id),
            },
          },
        },
        req.io,
        `user_${customerId}`,
        "notification"
      );
      created += 1;
    }

    return res.status(201).json({
      success: true,
      data: { targeted: uniqueCustomerIds.length, inAppCreated: created },
    });
  } catch (e) {
    console.error("Vendor broadcast error:", e);
    return res
      .status(500)
      .json({ success: false, message: "Server error broadcasting" });
  }
};

/** Customer replies to a vendor prompt (notifies vendor). */
exports.reply = async (req, res) => {
  try {
    const contact = await VendorCustomer.findById(req.params.id);
    if (!contact)
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });

    const { message } = req.body;
    const notif = await createInApp(
      {
        recipient: contact.vendor,
        sender: req.user.id,
        type: "other",
        title: "Customer Response",
        message,
      },
      req.io,
      `vendor_${contact.vendor}`,
      "notification"
    );

    return res
      .status(201)
      .json({ success: true, data: { notification: notif } });
  } catch (e) {
    console.error("Customer reply error:", e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
