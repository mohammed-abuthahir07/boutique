const express = require("express");

const ProfileController =
    require("../controllers/profileController");

const customerAuthMiddleware =
    require("../../middleware/customerAuthMiddleware");

const router = express.Router();

router.use(customerAuthMiddleware);

router.get(
    "/",
    ProfileController.getProfile
);

router.put(
    "/",
    ProfileController.updateProfile
);

module.exports = router;