
const express = require("express");

const productController = require("../controllers/productController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// ADMIN PRODUCT ROUTES
// All product and variant APIs require admin login
// =====================================================

router.use(authMiddleware);


// =====================================================
// PRODUCT VARIANT ROUTES
// These must come BEFORE /:id routes
// =====================================================

// Add color variant
// POST /api/admin/products/:id/variants
router.post(
    "/:id/variants",
    productController.createVariant
);

// Update color variant
// PUT /api/admin/products/:id/variants/:variantId
router.put(
    "/:id/variants/:variantId",
    productController.updateVariant
);

// Delete color variant
// DELETE /api/admin/products/:id/variants/:variantId
router.delete(
    "/:id/variants/:variantId",
    productController.deleteVariant
);


// =====================================================
// PRODUCT ROUTES
// =====================================================

// Get all products
// GET /api/admin/products
router.get(
    "/",
    productController.getAll
);

// Get single product
// GET /api/admin/products/:id
router.get(
    "/:id",
    productController.getById
);

// Create product
// POST /api/admin/products
router.post(
    "/",
    productController.create
);

// Update product
// PUT /api/admin/products/:id
router.put(
    "/:id",
    productController.update
);

// Delete product
// DELETE /api/admin/products/:id
router.delete(
    "/:id",
    productController.delete
);


module.exports = router;

