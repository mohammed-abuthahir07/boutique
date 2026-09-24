const express = require("express");
const AccountController = require("../controllers/accountController");
const customerAuthMiddleware =
    require("../../middleware/customerAuthMiddleware");

const router = express.Router();

router.use(customerAuthMiddleware);

router.delete("/", AccountController.deleteAccount);

module.exports = router;
