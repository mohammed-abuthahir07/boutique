const AccountModel = {

    async findById(connection, customerId) {
        const [rows] = await connection.query(`
            SELECT
                id,
                name,
                email,
                phone,
                profile_image
            FROM customers
            WHERE id = ?
            LIMIT 1
            FOR UPDATE
        `, [customerId]);

        return rows[0] || null;
    },

    async findOrdersByCustomerId(connection, customerId) {
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
                payment_method,
                payment_status,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                created_at,
                updated_at
            FROM orders
            WHERE customer_id = ?
            ORDER BY id ASC
            FOR UPDATE
        `, [customerId]);

        return rows;
    },

    async findOrderItemsByOrderId(connection, orderId) {
        const [rows] = await connection.query(`
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
            FOR UPDATE
        `, [orderId]);

        return rows;
    },

    async archiveOrder(connection, order) {
        const [result] = await connection.query(`
            INSERT INTO deleted_customer_orders
            (
                original_order_id,
                order_number,
                original_customer_id,
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
                razorpay_signature,
                original_created_at,
                original_updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            order.id,
            order.order_id,
            order.customer_id,
            order.customer_name,
            order.customer_email,
            order.customer_phone,
            order.shipping_address,
            order.total_amount,
            order.order_status,
            order.payment_method,
            order.payment_status,
            order.razorpay_order_id,
            order.razorpay_payment_id,
            order.razorpay_signature,
            order.created_at,
            order.updated_at
        ]);

        if (!result.insertId) {
            throw new Error("Failed to archive customer order");
        }

        return result.insertId;
    },

    async archiveOrderItem(connection, deletedCustomerOrderId, item) {
        const [result] = await connection.query(`
            INSERT INTO deleted_customer_order_items
            (
                deleted_customer_order_id,
                original_order_item_id,
                product_id,
                variant_id,
                variant_color,
                variant_size,
                product_name,
                price,
                quantity,
                subtotal,
                original_created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            deletedCustomerOrderId,
            item.id,
            item.product_id,
            item.variant_id,
            item.variant_color,
            item.variant_size,
            item.product_name,
            item.price,
            item.quantity,
            item.subtotal,
            item.created_at
        ]);

        if (!result.insertId) {
            throw new Error("Failed to archive customer order item");
        }

        return result.insertId;
    },

    async verifyArchivedOrder(connection, archivedOrderId, expectedItemCount) {
        const [orders] = await connection.query(`
            SELECT id
            FROM deleted_customer_orders
            WHERE id = ?
            LIMIT 1
        `, [archivedOrderId]);

        if (!orders[0]) {
            throw new Error("Archived order verification failed");
        }

        const [items] = await connection.query(`
            SELECT COUNT(*) AS item_count
            FROM deleted_customer_order_items
            WHERE deleted_customer_order_id = ?
        `, [archivedOrderId]);

        if (Number(items[0].item_count) !== Number(expectedItemCount)) {
            throw new Error("Archived order items verification failed");
        }
    },

    async deleteLiveOrderItems(connection, orderIds) {
        if (!orderIds.length) {
            return;
        }

        await connection.query(`
            DELETE FROM order_items
            WHERE order_id IN (?)
        `, [orderIds]);
    },

    async deleteLiveOrders(connection, customerId) {
        await connection.query(`
            DELETE FROM orders
            WHERE customer_id = ?
        `, [customerId]);
    },

    async deleteCartAndItems(connection, customerId) {
        const [carts] = await connection.query(`
            SELECT id
            FROM customer_carts
            WHERE customer_id = ?
            LIMIT 1
            FOR UPDATE
        `, [customerId]);

        if (!carts[0]) {
            return;
        }

        await connection.query(`
            DELETE FROM customer_cart_items
            WHERE cart_id = ?
        `, [carts[0].id]);

        await connection.query(`
            DELETE FROM customer_carts
            WHERE id = ?
        `, [carts[0].id]);
    },

    async deleteFavorites(connection, customerId) {
        await connection.query(`
            DELETE FROM customer_favorites
            WHERE customer_id = ?
        `, [customerId]);
    },

    async deleteCustomer(connection, customerId) {
        const [result] = await connection.query(`
            DELETE FROM customers
            WHERE id = ?
        `, [customerId]);

        if (result.affectedRows !== 1) {
            throw new Error("Failed to delete customer account");
        }
    }

};

module.exports = AccountModel;
