const express = require("express");

const orderController = require("../controllers/orderController");

const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);


// Get all orders
router.get("/", orderController.getAll);


// Get single order with items
router.get("/:id", orderController.getById);


// Update order status
router.put("/:id/status", orderController.updateStatus);


module.exports = router;