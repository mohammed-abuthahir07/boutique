const express = require("express");

const authController = require("../controllers/authController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Admin Authentication Routes
|--------------------------------------------------------------------------
*/

// Admin Login
router.post("/login", authController.login);

// Logged-in Admin Profile
router.get(
    "/profile",
    authMiddleware,
    authController.profile
);

module.exports = router;