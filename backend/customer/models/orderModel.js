const db = require("../../config/database");

const OrderModel = {

    // Get customer's cart items with current product/variant information
    async getCartItemsForOrder(customerId, connection) {

        const [rows] = await connection.query(`
            SELECT
                ci.id AS cart_item_id,
                ci.product_id,
                ci.variant_id,
                ci.quantity,

                p.name AS product_name,
                p.price,
                p.status AS product_status,

                c.status AS category_status,

                pv.color,
                pv.stock AS variant_stock

            FROM customer_cart_items ci

            INNER JOIN customer_carts cc
                ON ci.cart_id = cc.id

            INNER JOIN products p
                ON ci.product_id = p.id

            INNER JOIN categories c
                ON p.category_id = c.id

            INNER JOIN product_variants pv
                ON ci.variant_id = pv.id

            WHERE cc.customer_id = ?

            FOR UPDATE
        `, [customerId]);

        return rows;
    },


    // Create order
    async createOrder(connection, {
        customerId,
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        totalAmount
    }) {

        const [result] = await connection.query(`
            INSERT INTO orders
            (
                customer_id,
                order_id,
                customer_name,
                customer_email,
                customer_phone,
                shipping_address,
                total_amount,
                order_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
        `, [
            customerId,
            orderId,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            totalAmount
        ]);

        return result.insertId;
    },


    // Create order item
    async createOrderItem(connection, {
        orderId,
        productId,
        variantId,
        variantColor,
        productName,
        price,
        quantity,
        subtotal
    }) {

        const [result] = await connection.query(`
            INSERT INTO order_items
            (
                order_id,
                product_id,
                variant_id,
                variant_color,
                product_name,
                price,
                quantity,
                subtotal
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            orderId,
            productId,
            variantId,
            variantColor,
            productName,
            price,
            quantity,
            subtotal
        ]);

        return result.insertId;
    },


    // Reduce selected variant stock
    async reduceVariantStock(
        connection,
        variantId,
        quantity
    ) {

        const [result] = await connection.query(`
            UPDATE product_variants
            SET stock = stock - ?
            WHERE id = ?
              AND stock >= ?
        `, [
            quantity,
            variantId,
            quantity
        ]);

        return result.affectedRows;
    },


    // Clear customer's cart
    async clearCart(customerId, connection) {

        const [result] = await connection.query(`
            DELETE ci
            FROM customer_cart_items ci

            INNER JOIN customer_carts cc
                ON ci.cart_id = cc.id

            WHERE cc.customer_id = ?
        `, [customerId]);

        return result.affectedRows;
    },


    // Get created order
    async findOrderById(orderId, customerId, connection) {

        const [rows] = await connection.query(`
            SELECT
                id,
                customer_id,
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
            WHERE id = ?
              AND customer_id = ?
            LIMIT 1
        `, [
            orderId,
            customerId
        ]);

        return rows[0];
    },


    // Get order items
    async findOrderItems(orderId, connection) {

        const [rows] = await connection.query(`
            SELECT
                id,
                product_id,
                variant_id,
                variant_color,
                product_name,
                price,
                quantity,
                subtotal,
                created_at
            FROM order_items
            WHERE order_id = ?
            ORDER BY id ASC
        `, [orderId]);

        return rows;
    },


    // Get customer's orders
    async findOrdersByCustomerId(customerId) {

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
                created_at,
                updated_at
            FROM orders
            WHERE customer_id = ?
            ORDER BY created_at DESC
        `, [customerId]);

        return rows;
    },


    // Get one customer order
    async findCustomerOrderById(
        customerId,
        orderId
    ) {

        const [orders] = await db.query(`
            SELECT
                id,
                customer_id,
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
            WHERE customer_id = ?
              AND id = ?
            LIMIT 1
        `, [
            customerId,
            orderId
        ]);

        if (!orders[0]) {
            return null;
        }

        const [items] = await db.query(`
            SELECT
                id,
                product_id,
                variant_id,
                variant_color,
                product_name,
                price,
                quantity,
                subtotal,
                created_at
            FROM order_items
            WHERE order_id = ?
            ORDER BY id ASC
        `, [
            orderId
        ]);

        return {
            ...orders[0],
            items
        };
    }

};

module.exports = OrderModel;