const express = require("express");

const analyticsController =
    require("../controllers/analyticsController");

const authMiddleware =
    require("../../middleware/authMiddleware");

const router = express.Router();


// All analytics APIs require admin authentication
router.use(authMiddleware);


// Summary
router.get(
    "/summary",
    analyticsController.getSummary
);


// Order status
router.get(
    "/order-status",
    analyticsController.getOrderStatus
);


// Best selling products
router.get(
    "/best-selling-products",
    analyticsController.getBestSellingProducts
);


// Monthly orders
router.get(
    "/monthly-orders",
    analyticsController.getMonthlyOrders
);


// Monthly revenue
router.get(
    "/monthly-revenue",
    analyticsController.getMonthlyRevenue
);


// Category sales
router.get(
    "/category-sales",
    analyticsController.getCategorySales
);


module.exports = router;