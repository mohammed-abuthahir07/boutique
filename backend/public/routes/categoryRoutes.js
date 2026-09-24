const express = require("express");

const CategoryController =
    require("../controllers/categoryController");

const router = express.Router();


// =====================================================
// PUBLIC CATEGORY API
// No authentication required
// =====================================================

router.get(
    "/",
    CategoryController.getAll
);


module.exports = router;
