const db = require("../../config/database");

const CustomerModel = {

    // Get all customers
    async findAll() {
        const [rows] = await db.query(`
            SELECT
                id,
                name,
                email,
                phone,
                status,
                created_at,
                updated_at
            FROM customers
            ORDER BY created_at DESC
        `);

        return rows;
    },


    // Get one customer
    async findById(id) {
        const [rows] = await db.query(`
            SELECT
                id,
                name,
                email,
                phone,
                status,
                created_at,
                updated_at
            FROM customers
            WHERE id = ?
            LIMIT 1
        `, [id]);

        return rows[0];
    },


    // Get customer order summary
    // Customer-to-order relationship will be connected
    // later when orders.customer_id is added.
    async getPurchaseSummary(customerId) {
        return {
            total_orders: 0,
            total_products_bought: 0,
            total_spent: "0.00",
            last_order_date: null
        };
    },


    // Get customer orders
    // Will be connected after orders.customer_id is added.
    async getOrdersByCustomerId(customerId) {
        return [];
    },


    // Get one customer's order details
    // Will be connected after customer checkout/order system is built.
    async getOrderDetails(customerId, orderId) {
        return [];
    }

};

module.exports = CustomerModel;