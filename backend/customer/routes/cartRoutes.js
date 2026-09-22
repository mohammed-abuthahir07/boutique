const express = require("express");

const CartController =
    require("../controllers/cartController");

const customerAuthMiddleware =
    require("../../middleware/customerAuthMiddleware");

const router = express.Router();


// =====================================================
// CUSTOMER CART
// All cart APIs require customer authentication
// =====================================================

router.use(
    customerAuthMiddleware
);


// =====================================================
// ADD PRODUCT VARIANT TO CART
// =====================================================

router.post(
    "/",
    CartController.addToCart
);


// =====================================================
// GET CUSTOMER CART
// =====================================================

router.get(
    "/",
    CartController.getCart
);


// =====================================================
// UPDATE CART ITEM QUANTITY
// =====================================================

router.put(
    "/items/:itemId",
    CartController.updateQuantity
);


// =====================================================
// REMOVE CART ITEM
// =====================================================

router.delete(
    "/items/:itemId",
    CartController.removeItem
);


module.exports = router;