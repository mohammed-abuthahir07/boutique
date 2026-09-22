const express = require("express");

const FavoriteController =
    require("../controllers/favoriteController");

const customerAuthMiddleware =
    require("../../middleware/customerAuthMiddleware");

const router = express.Router();

// Every favorites API requires customer login
router.use(customerAuthMiddleware);

// Add favorite
router.post(
    "/:productId",
    FavoriteController.addFavorite
);

// Get my favorites
router.get(
    "/",
    FavoriteController.getFavorites
);

// Check favorite
router.get(
    "/:productId",
    FavoriteController.checkFavorite
);

// Remove favorite
router.delete(
    "/:productId",
    FavoriteController.removeFavorite
);

module.exports = router;