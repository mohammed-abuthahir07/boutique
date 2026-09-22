const express = require("express");

const ProductController =
    require("../controllers/productController");

const router = express.Router();


// =====================================================
// PUBLIC PRODUCT API
// No authentication required
// =====================================================


// GET ALL ACTIVE PRODUCTS
router.get(
    "/",
    ProductController.getAll
);


// GET SINGLE ACTIVE PRODUCT
router.get(
    "/:id",
    ProductController.getById
);


module.exports = router;