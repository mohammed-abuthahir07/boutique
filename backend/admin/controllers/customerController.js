const CustomerModel = require("../models/customerModel");

const CustomerController = {

    // GET /api/admin/customers
    async getAll(req, res) {
        try {
            const customers = await CustomerModel.findAll();

            res.json({
                success: true,
                customers
            });

        } catch (error) {
            console.error("Get customers error:", error);

            res.status(500).json({
                success: false,
                message: "Failed to fetch customers",
                error: error.message
            });
        }
    },


    // GET /api/admin/customers/:id
    async getById(req, res) {
        try {
            const customerId = Number(req.params.id);

            if (!Number.isInteger(customerId) || customerId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid customer ID"
                });
            }

            const customer = await CustomerModel.findById(customerId);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });
            }

            const summary = await CustomerModel.getPurchaseSummary(
                customerId
            );

            res.json({
                success: true,
                customer: {
                    ...customer,
                    purchase_summary: summary
                }
            });

        } catch (error) {
            console.error("Get customer details error:", error);

            res.status(500).json({
                success: false,
                message: "Failed to fetch customer details",
                error: error.message
            });
        }
    },


    // GET /api/admin/customers/:id/orders
    async getOrders(req, res) {
        try {
            const customerId = Number(req.params.id);

            if (!Number.isInteger(customerId) || customerId <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid customer ID"
                });
            }

            const customer = await CustomerModel.findById(customerId);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });
            }

            const orders = await CustomerModel.getOrdersByCustomerId(
                customerId
            );

            res.json({
                success: true,
                customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email
                },
                orders
            });

        } catch (error) {
            console.error("Get customer orders error:", error);

            res.status(500).json({
                success: false,
                message: "Failed to fetch customer orders",
                error: error.message
            });
        }
    },


    // GET /api/admin/customers/:id/orders/:orderId
    async getOrderDetails(req, res) {
        try {
            const customerId = Number(req.params.id);
            const orderId = Number(req.params.orderId);

            if (
                !Number.isInteger(customerId) ||
                customerId <= 0 ||
                !Number.isInteger(orderId) ||
                orderId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid customer ID or order ID"
                });
            }

            const customer = await CustomerModel.findById(customerId);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });
            }

            const orderItems = await CustomerModel.getOrderDetails(
                customerId,
                orderId
            );

            res.json({
                success: true,
                customer: {
                    id: customer.id,
                    name: customer.name,
                    email: customer.email
                },
                order: null,
                items: orderItems
            });

        } catch (error) {
            console.error(
                "Get customer order details error:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Failed to fetch order details",
                error: error.message
            });
        }
    }

};

module.exports = CustomerController;