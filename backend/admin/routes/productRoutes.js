const express = require("express");

const productController = require("../controllers/productController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// All product APIs require admin authentication
router.use(authMiddleware);

// Get all products
router.get("/", productController.getAll);

// Get single product
router.get("/:id", productController.getById);

// Create product
router.post("/", productController.create);

// Update product
router.put("/:id", productController.update);

// Delete product
router.delete("/:id", productController.delete);

module.exports = router;