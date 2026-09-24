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


    // Get customer purchase summary
    async getPurchaseSummary(customerId) {
        const [rows] = await db.query(`
            SELECT
                COUNT(*) AS total_orders,

                COALESCE(
                    (
                        SELECT SUM(oi.quantity)
                        FROM order_items oi
                        INNER JOIN orders o2
                            ON o2.id = oi.order_id
                        WHERE o2.customer_id = ?
                    ),
                    0
                ) AS total_products_bought,

                COALESCE(
                    SUM(total_amount),
                    0.00
                ) AS total_spent,

                MAX(created_at) AS last_order_date

            FROM orders
            WHERE customer_id = ?
        `, [customerId, customerId]);

        const summary = rows[0];

        return {
            total_orders: Number(summary.total_orders || 0),
            total_products_bought: Number(summary.total_products_bought || 0),
            total_spent: Number(summary.total_spent || 0).toFixed(2),
            last_order_date: summary.last_order_date || null
        };
    },


    // Get all orders belonging to a customer
    async getOrdersByCustomerId(customerId) {
        const [rows] = await db.query(`
            SELECT
                o.id,
                o.order_id,
                o.customer_id,
                o.customer_name,
                o.customer_email,
                o.customer_phone,
                o.shipping_address,
                o.total_amount,
                o.order_status,
                o.created_at,
                o.updated_at,

                COALESCE(
                    (
                        SELECT SUM(oi.quantity)
                        FROM order_items oi
                        WHERE oi.order_id = o.id
                    ),
                    0
                ) AS total_products,

                COALESCE(
                    (
                        SELECT COUNT(*)
                        FROM order_items oi
                        WHERE oi.order_id = o.id
                    ),
                    0
                ) AS total_items

            FROM orders o
            WHERE o.customer_id = ?
            ORDER BY o.created_at DESC
        `, [customerId]);

        return rows.map(order => ({
            ...order,
            total_amount: Number(order.total_amount || 0).toFixed(2),
            total_products: Number(order.total_products || 0),
            total_items: Number(order.total_items || 0)
        }));
    },


    // Get one customer's specific order details
    async getOrderDetails(customerId, orderId) {

        // Get order
        const [orders] = await db.query(`
            SELECT
                o.id,
                o.order_id,
                o.customer_id,
                o.customer_name,
                o.customer_email,
                o.customer_phone,
                o.shipping_address,
                o.total_amount,
                o.order_status,
                o.created_at,
                o.updated_at
            FROM orders o
            WHERE o.customer_id = ?
              AND o.id = ?
            LIMIT 1
        `, [customerId, orderId]);

        if (orders.length === 0) {
            return null;
        }

        const order = {
            ...orders[0],
            total_amount: Number(orders[0].total_amount || 0).toFixed(2)
        };


        // Get order items
        const [items] = await db.query(`
            SELECT
                oi.id,
                oi.order_id,
                oi.product_id,
                oi.variant_id,
                oi.variant_color,
                oi.variant_size,
                oi.product_name,
                oi.price,
                oi.quantity,
                oi.subtotal,
                oi.created_at
            FROM order_items oi
            WHERE oi.order_id = ?
            ORDER BY oi.id ASC
        `, [orders[0].id]);


        return {
            order,
            items: items.map(item => ({
                ...item,
                price: Number(item.price || 0).toFixed(2),
                subtotal: Number(item.subtotal || 0).toFixed(2),
                quantity: Number(item.quantity || 0)
            }))
        };
    }

};

module.exports = CustomerModel;