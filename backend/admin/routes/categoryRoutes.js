const express = require("express");

const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// All category APIs require admin authentication
router.use(authMiddleware);

// Get all categories
router.get("/", categoryController.getAll);

// Get single category
router.get("/:id", categoryController.getById);

// Create category
router.post("/", categoryController.create);

// Update category
router.put("/:id", categoryController.update);

// Delete category
router.delete("/:id", categoryController.delete);

module.exports = router;