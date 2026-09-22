const express = require("express");

const CartController =
    require("../controllers/cartController");

const customerAuthMiddleware =
    require("../../middleware/customerAuthMiddleware");

const router = express.Router();

router.use(customerAuthMiddleware);

router.post(
    "/",
    CartController.addToCart
);

router.get(
    "/",
    CartController.getCart
);

router.put(
    "/items/:itemId",
    CartController.updateQuantity
);

router.delete(
    "/items/:itemId",
    CartController.removeItem
);

module.exports = router;