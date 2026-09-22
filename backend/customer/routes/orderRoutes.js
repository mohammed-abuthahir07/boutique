const express = require("express");

const OrderController =
    require("../controllers/orderController");

const customerAuthMiddleware =
    require("../../middleware/customerAuthMiddleware");

const router = express.Router();


// Every order API requires customer login
router.use(customerAuthMiddleware);


// Create order from cart
router.post(
    "/",
    OrderController.createOrder
);


// Get logged-in customer's orders
router.get(
    "/",
    OrderController.getMyOrders
);


// Get one logged-in customer's order
router.get(
    "/:id",
    OrderController.getMyOrderById
);


module.exports = router;