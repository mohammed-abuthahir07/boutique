const express = require("express");

const ProductController =
    require("../controllers/productController");

const router = express.Router();

// Public API
// No authentication middleware here.

router.get("/", ProductController.getAll);

router.get("/:id", ProductController.getById);

module.exports = router;