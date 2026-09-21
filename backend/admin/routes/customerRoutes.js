const express = require("express");

const customerController = require("../controllers/customerController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// All customer management APIs require admin authentication
router.use(authMiddleware);


// Get all customers
router.get("/", customerController.getAll);


// Get one customer
router.get("/:id", customerController.getById);


// Get all orders for one customer
router.get("/:id/orders", customerController.getOrders);


// Get one specific customer order
router.get(
    "/:id/orders/:orderId",
    customerController.getOrderDetails
);

module.exports = router;