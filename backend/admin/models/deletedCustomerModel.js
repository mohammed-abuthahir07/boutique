const db = require("../../config/database");

function formatMoney(value) {
    return Number(value || 0).toFixed(2);
}

const DeletedCustomerModel = {

    async findGroupedCustomers(search) {
        const params = [];
        let where = "";

        if (search && String(search).trim()) {
            const like = `%${String(search).trim()}%`;
            where = `
                WHERE (
                    latest.customer_name LIKE ?
                    OR latest.customer_email LIKE ?
                    OR IFNULL(latest.customer_phone, '') LIKE ?
                    OR CAST(o.original_customer_id AS CHAR) LIKE ?
                )
            `;
            params.push(like, like, like, like);
        }

        const [rows] = await db.query(`
            SELECT
                o.original_customer_id,
                latest.customer_name,
                latest.customer_email,
                latest.customer_phone,
                COUNT(*) AS total_orders,
                COALESCE(SUM(o.total_amount), 0) AS total_spent,
                MAX(o.original_created_at) AS last_order_date,
                MAX(o.deleted_at) AS deleted_at,
                COALESCE((
                    SELECT SUM(i.quantity)
                    FROM deleted_customer_order_items i
                    INNER JOIN deleted_customer_orders o2
                        ON o2.id = i.deleted_customer_order_id
                    WHERE o2.original_customer_id = o.original_customer_id
                ), 0) AS total_products_bought
            FROM deleted_customer_orders o
            INNER JOIN (
                SELECT
                    d1.original_customer_id,
                    d1.customer_name,
                    d1.customer_email,
                    d1.customer_phone
                FROM deleted_customer_orders d1
                INNER JOIN (
                    SELECT
                        original_customer_id,
                        MAX(id) AS max_id
                    FROM deleted_customer_orders
                    GROUP BY original_customer_id
                ) d2
                    ON d2.max_id = d1.id
            ) latest
                ON latest.original_customer_id = o.original_customer_id
            ${where}
            GROUP BY
                o.original_customer_id,
                latest.customer_name,
                latest.customer_email,
                latest.customer_phone
            ORDER BY MAX(o.deleted_at) DESC, o.original_customer_id DESC
        `, params);

        return rows.map((row) => ({
            original_customer_id: Number(row.original_customer_id),
            customer_name: row.customer_name,
            customer_email: row.customer_email,
            customer_phone: row.customer_phone,
            total_orders: Number(row.total_orders || 0),
            total_products_bought: Number(row.total_products_bought || 0),
            total_spent: formatMoney(row.total_spent),
            last_order_date: row.last_order_date || null,
            deleted_at: row.deleted_at || null
        }));
    },

    async findCustomerIdentity(originalCustomerId) {
        const [rows] = await db.query(`
            SELECT
                original_customer_id,
                customer_name,
                customer_email,
                customer_phone,
                deleted_at
            FROM deleted_customer_orders
            WHERE original_customer_id = ?
            ORDER BY id DESC
            LIMIT 1
        `, [originalCustomerId]);

        return rows[0] || null;
    },

    async getPurchaseSummary(originalCustomerId) {
        const [orderRows] = await db.query(`
            SELECT
                COUNT(*) AS total_orders,
                COALESCE(SUM(total_amount), 0) AS total_spent,
                MAX(original_created_at) AS last_order_date,
                MAX(deleted_at) AS deleted_at
            FROM deleted_customer_orders
            WHERE original_customer_id = ?
        `, [originalCustomerId]);

        const [itemRows] = await db.query(`
            SELECT
                COALESCE(SUM(i.quantity), 0) AS total_products_bought
            FROM deleted_customer_order_items i
            INNER JOIN deleted_customer_orders o
                ON o.id = i.deleted_customer_order_id
            WHERE o.original_customer_id = ?
        `, [originalCustomerId]);

        const orders = orderRows[0] || {};
        const items = itemRows[0] || {};

        return {
            total_orders: Number(orders.total_orders || 0),
            total_products_bought: Number(items.total_products_bought || 0),
            total_spent: formatMoney(orders.total_spent),
            last_order_date: orders.last_order_date || null,
            deleted_at: orders.deleted_at || null
        };
    },

    async findOrdersByOriginalCustomerId(originalCustomerId) {
        const [rows] = await db.query(`
            SELECT
                o.id,
                o.original_order_id,
                o.order_number,
                o.original_customer_id,
                o.customer_name,
                o.customer_email,
                o.customer_phone,
                o.shipping_address,
                o.total_amount,
                o.order_status,
                o.payment_method,
                o.payment_status,
                o.razorpay_order_id,
                o.razorpay_payment_id,
                o.original_created_at,
                o.original_updated_at,
                o.deleted_at,
                COALESCE((
                    SELECT SUM(i.quantity)
                    FROM deleted_customer_order_items i
                    WHERE i.deleted_customer_order_id = o.id
                ), 0) AS item_count
            FROM deleted_customer_orders o
            WHERE o.original_customer_id = ?
            ORDER BY o.original_created_at DESC, o.id DESC
        `, [originalCustomerId]);

        return rows.map((row) => ({
            id: Number(row.id),
            original_order_id: Number(row.original_order_id),
            order_number: row.order_number,
            original_customer_id: Number(row.original_customer_id),
            customer_name: row.customer_name,
            customer_email: row.customer_email,
            customer_phone: row.customer_phone,
            shipping_address: row.shipping_address,
            total_amount: formatMoney(row.total_amount),
            order_status: row.order_status,
            payment_method: row.payment_method,
            payment_status: row.payment_status,
            razorpay_order_id: row.razorpay_order_id,
            razorpay_payment_id: row.razorpay_payment_id,
            created_at: row.original_created_at,
            updated_at: row.original_updated_at,
            deleted_at: row.deleted_at,
            item_count: Number(row.item_count || 0)
        }));
    },

    async findOrderDetails(originalCustomerId, archiveOrderId) {
        const [orders] = await db.query(`
            SELECT
                id,
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
                original_updated_at,
                deleted_at
            FROM deleted_customer_orders
            WHERE id = ?
              AND original_customer_id = ?
            LIMIT 1
        `, [archiveOrderId, originalCustomerId]);

        if (!orders[0]) {
            return null;
        }

        const [items] = await db.query(`
            SELECT
                id,
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
            FROM deleted_customer_order_items
            WHERE deleted_customer_order_id = ?
            ORDER BY id ASC
        `, [archiveOrderId]);

        const order = orders[0];

        return {
            order: {
                id: Number(order.id),
                original_order_id: Number(order.original_order_id),
                order_number: order.order_number,
                original_customer_id: Number(order.original_customer_id),
                customer_name: order.customer_name,
                customer_email: order.customer_email,
                customer_phone: order.customer_phone,
                shipping_address: order.shipping_address,
                total_amount: formatMoney(order.total_amount),
                order_status: order.order_status,
                payment_method: order.payment_method,
                payment_status: order.payment_status,
                razorpay_order_id: order.razorpay_order_id,
                razorpay_payment_id: order.razorpay_payment_id,
                razorpay_signature: order.razorpay_signature,
                created_at: order.original_created_at,
                updated_at: order.original_updated_at,
                deleted_at: order.deleted_at
            },
            items: items.map((item) => ({
                id: Number(item.id),
                deleted_customer_order_id: Number(item.deleted_customer_order_id),
                original_order_item_id: Number(item.original_order_item_id),
                product_id: item.product_id,
                variant_id: item.variant_id,
                variant_color: item.variant_color,
                variant_size: item.variant_size,
                product_name: item.product_name,
                price: formatMoney(item.price),
                quantity: Number(item.quantity || 0),
                subtotal: formatMoney(item.subtotal),
                created_at: item.original_created_at
            }))
        };
    },

    async permanentlyDeleteArchive(originalCustomerId) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const [orders] = await connection.query(`
                SELECT id
                FROM deleted_customer_orders
                WHERE original_customer_id = ?
                FOR UPDATE
            `, [originalCustomerId]);

            if (!orders.length) {
                await connection.rollback();
                return { deleted: false };
            }

            const orderIds = orders.map((row) => row.id);

            await connection.query(`
                DELETE FROM deleted_customer_order_items
                WHERE deleted_customer_order_id IN (?)
            `, [orderIds]);

            await connection.query(`
                DELETE FROM deleted_customer_orders
                WHERE original_customer_id = ?
            `, [originalCustomerId]);

            await connection.commit();
            return { deleted: true, archived_order_count: orderIds.length };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

};

module.exports = DeletedCustomerModel;
