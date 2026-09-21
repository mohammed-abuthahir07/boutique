const express = require("express");

const dashboardController =
    require("../controllers/dashboardController");

const authMiddleware =
    require("../../middleware/authMiddleware");

const router = express.Router();


// =========================================================
// ADMIN AUTHENTICATION
// =========================================================

router.use(authMiddleware);


// =========================================================
// DASHBOARD SUMMARY
// =========================================================

router.get(
    "/summary",
    dashboardController.getSummary
);


// =========================================================
// MONTHLY REVENUE
// =========================================================

router.get(
    "/monthly-revenue",
    dashboardController.getMonthlyRevenue
);


// =========================================================
// YEARLY REVENUE
// =========================================================

router.get(
    "/yearly-revenue",
    dashboardController.getYearlyRevenue
);


// =========================================================
// RECENT ORDERS
// =========================================================

router.get(
    "/recent-orders",
    dashboardController.getRecentOrders
);


// =========================================================
// RECENT PRODUCTS
// =========================================================

router.get(
    "/recent-products",
    dashboardController.getRecentProducts
);


// =========================================================
// LOW STOCK
// =========================================================

router.get(
    "/low-stock",
    dashboardController.getLowStock
);


// =========================================================
// RECENT ACTIVITY
// =========================================================

router.get(
    "/recent-activity",
    dashboardController.getRecentActivity
);


module.exports = router;