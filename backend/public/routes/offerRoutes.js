const express = require("express");

const OfferController =
    require("../controllers/offerController");

const router = express.Router();

// Public API
// No authentication required.

router.get("/", OfferController.getAll);

router.get("/:id", OfferController.getById);

module.exports = router;