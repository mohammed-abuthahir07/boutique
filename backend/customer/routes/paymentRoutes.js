const express = require("express");

const PaymentController =
    require("../controllers/paymentController");

const customerAuthMiddleware =
    require("../../middleware/customerAuthMiddleware");

const router = express.Router();

router.use(customerAuthMiddleware);

router.post(
    "/razorpay/create-order",
    PaymentController.createRazorpayOrder
);

router.post(
    "/razorpay/verify",
    PaymentController.verifyRazorpayPayment
);

module.exports = router;
