const express = require("express");

const inventoryController =
    require("../controllers/inventoryController");

const authMiddleware =
    require("../../middleware/authMiddleware");

const router = express.Router();


// All inventory APIs require admin authentication
router.use(authMiddleware);


// Get product stock
router.get(
    "/",
    inventoryController.getInventory
);


module.exports = router;