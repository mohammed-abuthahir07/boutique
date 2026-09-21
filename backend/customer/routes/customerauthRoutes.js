const express = require("express");

const CustomerAuthController =
    require("../controllers/customerauthController");

const customerAuthMiddleware =
    require("../../middleware/customerAuthMiddleware");

const router = express.Router();


// ==========================================
// CUSTOMER REGISTER
// ==========================================

router.post(
    "/register",
    CustomerAuthController.register
);


// ==========================================
// CUSTOMER EMAIL/PASSWORD LOGIN
// ==========================================

router.post(
    "/login",
    CustomerAuthController.login
);


// ==========================================
// CUSTOMER GOOGLE LOGIN
// ==========================================

router.post(
    "/google",
    CustomerAuthController.googleLogin
);


// ==========================================
// CUSTOMER PROFILE
// ==========================================

router.get(
    "/profile",
    customerAuthMiddleware,
    CustomerAuthController.profile
);


module.exports = router;