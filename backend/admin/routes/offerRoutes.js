const express = require("express");

const offerController = require("../controllers/offerController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// All offer APIs require admin authentication
router.use(authMiddleware);

// Get all offers
router.get("/", offerController.getAll);

// Get one offer
router.get("/:id", offerController.getById);

// Create offer
router.post("/", offerController.create);

// Update offer
router.put("/:id", offerController.update);

// Delete offer
router.delete("/:id", offerController.delete);

module.exports = router;