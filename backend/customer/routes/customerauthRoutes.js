const express = require("express");

const CustomerAuthController =
    require("../controllers/customerauthController");

const customerAuthMiddleware =
    require("../../middleware/customerAuthMiddleware");

const router = express.Router();


// =====================================================
// PUBLIC CUSTOMER AUTH ROUTES
// =====================================================

// Customer registration
router.post(
    "/register",
    CustomerAuthController.register
);


// Customer login
router.post(
    "/login",
    CustomerAuthController.login
);


// =====================================================
// PROTECTED CUSTOMER ROUTES
// =====================================================

// Customer profile
router.get(
    "/profile",
    customerAuthMiddleware,
    CustomerAuthController.profile
);


module.exports = router;