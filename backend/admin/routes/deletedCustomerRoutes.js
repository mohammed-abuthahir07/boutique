const express = require("express");
const deletedCustomerController = require("../controllers/deletedCustomerController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get("/", deletedCustomerController.getAll);
router.get("/:customerId", deletedCustomerController.getById);
router.get(
    "/:customerId/orders/:orderId",
    deletedCustomerController.getOrderDetails
);
router.delete("/:customerId", deletedCustomerController.deletePermanently);

module.exports = router;
