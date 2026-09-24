const db = require("../../config/database");

const OrderModel = {

    async findAll() {

        const [rows] = await db.query(`
            SELECT
                id,
                order_id,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                total_amount,
                order_status,
                payment_method,
                payment_status,
                created_at,
                updated_at
            FROM orders
            ORDER BY id DESC
        `);

        return rows;
    },


    async findById(id) {

        const [rows] = await db.query(
            `
            SELECT
                id,
                order_id,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                total_amount,
                order_status,
                payment_method,
                payment_status,
                razorpay_order_id,
                razorpay_payment_id,
                created_at,
                updated_at
            FROM orders
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        return rows[0] || null;
    },


    async findByOrderId(orderId) {

        const [rows] = await db.query(
            `
            SELECT
                id,
                order_id,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                total_amount,
                order_status,
                created_at,
                updated_at
            FROM orders
            WHERE order_id = ?
            LIMIT 1
            `,
            [orderId]
        );

        return rows[0] || null;
    },


    async create(connection, {
        order_id,
        customer_name,
        customer_email,
        customer_phone,
        shipping_address,
        total_amount
    }) {

        const [result] = await connection.query(
            `
            INSERT INTO orders (
                order_id,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                total_amount,
                order_status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING')
            `,
            [
                order_id,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                total_amount
            ]
        );

        return result.insertId;
    },


    async updateStatus(id, orderStatus) {

        const [result] = await db.query(
            `
            UPDATE orders
            SET order_status = ?
            WHERE id = ?
            `,
            [orderStatus, id]
        );

        return result.affectedRows;
    }

};

module.exports = OrderModel;