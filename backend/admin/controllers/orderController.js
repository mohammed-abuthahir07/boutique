const OrderModel = require("../models/orderModel");
const OrderItemModel = require("../models/orderItemModel");

const orderController = {

    // GET ALL ORDERS
    async getAll(req, res) {

        try {

            const orders = await OrderModel.findAll();

            return res.status(200).json({
                success: true,
                orders
            });

        } catch (error) {

            console.error("Get orders error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // GET SINGLE ORDER WITH ITEMS
    async getById(req, res) {

        try {

            const { id } = req.params;

            const order = await OrderModel.findById(id);

            if (!order) {

                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            const items = await OrderItemModel.findByOrderId(order.id);

            return res.status(200).json({
                success: true,
                order: {
                    ...order,
                    items
                }
            });

        } catch (error) {

            console.error("Get order error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    },


    // UPDATE ORDER STATUS
    async updateStatus(req, res) {

        try {

            const { id } = req.params;
            const { order_status } = req.body;

            const allowedStatuses = [
                "PENDING",
                "CONFIRMED",
                "PROCESSING",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED"
            ];

            if (!order_status) {

                return res.status(400).json({
                    success: false,
                    message: "Order status is required"
                });
            }

            if (!allowedStatuses.includes(order_status)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid order status"
                });
            }

            const order = await OrderModel.findById(id);

            if (!order) {

                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }

            await OrderModel.updateStatus(
                id,
                order_status
            );

            return res.status(200).json({
                success: true,
                message: "Order status updated successfully"
            });

        } catch (error) {

            console.error("Update order status error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error"
            });
        }
    }

};

module.exports = orderController;