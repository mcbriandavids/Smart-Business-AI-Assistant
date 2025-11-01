/**
 * Customer Routes
 * --------------
 * RESTful endpoints for vendor's customers (CRUD + messaging).
 */
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const CrudController = require("../controllers/customers.crud.controller");
const MessagingController = require("../controllers/customers.messaging.controller");

// All routes require authentication as vendor or owner
router.use(protect, authorize("vendor", "owner"));

// CRUD

// CRUD
router.post("/", CrudController.createCustomer); // Create
router.get("/", CrudController.getCustomers); // List all
router.get("/:id", CrudController.getCustomer); // Get one
router.put("/:id", CrudController.updateCustomer); // Update
router.delete("/:id", CrudController.deleteCustomer); // Delete

// Messaging
// Messaging
router.post("/:id/message", MessagingController.sendMessage); // Send message to one customer

module.exports = router;
