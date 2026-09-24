const DeletedCustomerModel = require("../models/deletedCustomerModel");

function parsePositiveInt(value) {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

const DeletedCustomerController = {

    async getAll(req, res) {
        try {
            const search = req.query.search || "";
            const customers = await DeletedCustomerModel.findGroupedCustomers(search);

            return res.json({
                success: true,
                customers
            });
        } catch (error) {
            console.error("Get deleted customers error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch deleted customers"
            });
        }
    },

    async getById(req, res) {
        try {
            const customerId = parsePositiveInt(req.params.customerId);

            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid customer ID"
                });
            }

            const identity = await DeletedCustomerModel.findCustomerIdentity(customerId);

            if (!identity) {
                return res.status(404).json({
                    success: false,
                    message: "Archived customer not found"
                });
            }

            const summary = await DeletedCustomerModel.getPurchaseSummary(customerId);
            const orders = await DeletedCustomerModel.findOrdersByOriginalCustomerId(customerId);

            return res.json({
                success: true,
                customer: {
                    original_customer_id: Number(identity.original_customer_id),
                    customer_name: identity.customer_name,
                    customer_email: identity.customer_email,
                    customer_phone: identity.customer_phone,
                    deleted_at: summary.deleted_at || identity.deleted_at
                },
                summary: {
                    total_orders: summary.total_orders,
                    total_products_bought: summary.total_products_bought,
                    total_spent: summary.total_spent,
                    last_order_date: summary.last_order_date
                },
                orders
            });
        } catch (error) {
            console.error("Get deleted customer details error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch deleted customer details"
            });
        }
    },

    async getOrderDetails(req, res) {
        try {
            const customerId = parsePositiveInt(req.params.customerId);
            const orderId = parsePositiveInt(req.params.orderId);

            if (!customerId || !orderId) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid customer ID or order ID"
                });
            }

            const result = await DeletedCustomerModel.findOrderDetails(
                customerId,
                orderId
            );

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: "Archived order not found for this customer"
                });
            }

            return res.json({
                success: true,
                order: result.order,
                items: result.items
            });
        } catch (error) {
            console.error("Get deleted customer order details error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch archived order details"
            });
        }
    },

    async deletePermanently(req, res) {
        try {
            const customerId = parsePositiveInt(req.params.customerId);

            if (!customerId) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid customer ID"
                });
            }

            const result = await DeletedCustomerModel.permanentlyDeleteArchive(customerId);

            if (!result.deleted) {
                return res.status(404).json({
                    success: false,
                    message: "Archived customer not found"
                });
            }

            return res.json({
                success: true,
                message: "Archived customer deleted permanently."
            });
        } catch (error) {
            console.error("Permanently delete archived customer error:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to permanently delete this archived customer. Please try again."
            });
        }
    }

};

module.exports = DeletedCustomerController;
