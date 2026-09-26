const db = require("../../config/database");

const OrderItemModel = {

    async create(connection, {
        order_id,
        product_id,
        product_name,
        price,
        quantity,
        subtotal
    }) {

        const [result] = await connection.query(
            `
            INSERT INTO order_items (
                order_id,
                product_id,
                product_name,
                price,
                quantity,
                subtotal
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                order_id,
                product_id,
                product_name,
                price,
                quantity,
                subtotal
            ]
        );

        return result.insertId;
    },


    async findByOrderId(orderId) {

        const [rows] = await db.query(
            `
            SELECT
                id,
                order_id,
                product_id,
                variant_id,
                variant_color,
                variant_size,
                product_name,
                price,
                quantity,
                subtotal,
                created_at
            FROM order_items
            WHERE order_id = ?
            ORDER BY id ASC
            `,
            [orderId]
        );

        return rows;
    }

};

module.exports = OrderItemModel;