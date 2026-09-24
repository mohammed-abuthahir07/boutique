const bcrypt = require("bcryptjs");
const db = require("../config/database");
const AccountModel = require("../customer/models/accountModel");

async function pickCatalog(connection) {
    const [variants] = await connection.query(`
        SELECT
            pv.id AS variant_id,
            pv.product_id,
            pv.color,
            pv.size,
            p.name AS product_name,
            p.price
        FROM product_variants pv
        INNER JOIN products p ON p.id = pv.product_id
        WHERE p.status = 'ACTIVE'
        ORDER BY pv.id ASC
        LIMIT 3
    `);

    if (variants.length < 2) {
        throw new Error("Need at least two product variants to test archive");
    }

    return variants;
}

async function createTestCustomer(connection, email) {
    const password = await bcrypt.hash("TestDelete123!", 10);
    const [result] = await connection.query(`
        INSERT INTO customers
            (name, email, phone, password, status)
        VALUES (?, ?, ?, ?, 'ACTIVE')
    `, [
        "Delete Account Test",
        email,
        "9990001111",
        password
    ]);
    return result.insertId;
}

async function seedCustomerData(connection, customerId, variants) {
    const [fav] = await connection.query(`
        INSERT INTO customer_favorites (customer_id, product_id)
        VALUES (?, ?)
    `, [customerId, variants[0].product_id]);

    const [cart] = await connection.query(`
        INSERT INTO customer_carts (customer_id)
        VALUES (?)
    `, [customerId]);

    await connection.query(`
        INSERT INTO customer_cart_items
            (cart_id, product_id, variant_id, quantity)
        VALUES (?, ?, ?, 1)
    `, [cart.insertId, variants[1].product_id, variants[1].variant_id]);

    const [order1] = await connection.query(`
        INSERT INTO orders
        (
            customer_id, order_id, customer_name, customer_email, customer_phone,
            shipping_address, total_amount, order_status, payment_method, payment_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', 'DIRECT', 'PENDING')
    `, [
        customerId,
        `ORD-DELTEST-${customerId}-1`,
        "Delete Account Test",
        `delete-archive-test-${customerId}@example.com`,
        "9990001111",
        "12 Archive Street, Test City",
        Number(variants[0].price) * 2
    ]);

    await connection.query(`
        INSERT INTO order_items
        (
            order_id, product_id, variant_id, variant_color, variant_size,
            product_name, price, quantity, subtotal
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 2, ?)
    `, [
        order1.insertId,
        variants[0].product_id,
        variants[0].variant_id,
        variants[0].color,
        variants[0].size,
        variants[0].product_name,
        variants[0].price,
        Number(variants[0].price) * 2
    ]);

    if (variants[2]) {
        await connection.query(`
            INSERT INTO order_items
            (
                order_id, product_id, variant_id, variant_color, variant_size,
                product_name, price, quantity, subtotal
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
        `, [
            order1.insertId,
            variants[2].product_id,
            variants[2].variant_id,
            variants[2].color,
            variants[2].size,
            variants[2].product_name,
            variants[2].price,
            variants[2].price
        ]);
    }

    const [order2] = await connection.query(`
        INSERT INTO orders
        (
            customer_id, order_id, customer_name, customer_email, customer_phone,
            shipping_address, total_amount, order_status,
            payment_method, payment_status, razorpay_order_id,
            razorpay_payment_id, razorpay_signature
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', 'RAZORPAY', 'PAID', ?, ?, ?)
    `, [
        customerId,
        `ORD-DELTEST-${customerId}-2`,
        "Delete Account Test",
        `delete-archive-test-${customerId}@example.com`,
        "9990001111",
        "12 Archive Street, Test City",
        variants[1].price,
        `rzp_test_order_${customerId}`,
        `pay_test_${customerId}`,
        `sig_test_${customerId}`
    ]);

    await connection.query(`
        INSERT INTO order_items
        (
            order_id, product_id, variant_id, variant_color, variant_size,
            product_name, price, quantity, subtotal
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `, [
        order2.insertId,
        variants[1].product_id,
        variants[1].variant_id,
        variants[1].color,
        variants[1].size,
        variants[1].product_name,
        variants[1].price,
        variants[1].price
    ]);

    return {
        favoriteId: fav.insertId,
        cartId: cart.insertId,
        orderIds: [order1.insertId, order2.insertId],
        expectedArchivedItems: variants[2] ? 3 : 2,
        productIds: [...new Set(variants.map((row) => row.product_id))],
        variantIds: variants.map((row) => row.variant_id)
    };
}

async function count(connection, sql, params) {
    const [rows] = await connection.query(sql, params);
    return Number(Object.values(rows[0])[0]);
}

async function runDeleteFlow(customerId) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const customer = await AccountModel.findById(connection, customerId);
        if (!customer) {
            throw new Error("Customer not found");
        }

        const orders = await AccountModel.findOrdersByCustomerId(
            connection,
            customerId
        );

        for (const order of orders) {
            const archivedOrderId = await AccountModel.archiveOrder(
                connection,
                order
            );
            const items = await AccountModel.findOrderItemsByOrderId(
                connection,
                order.id
            );
            for (const item of items) {
                await AccountModel.archiveOrderItem(
                    connection,
                    archivedOrderId,
                    item
                );
            }
            await AccountModel.verifyArchivedOrder(
                connection,
                archivedOrderId,
                items.length
            );
        }

        await AccountModel.deleteLiveOrderItems(
            connection,
            orders.map((order) => order.id)
        );
        await AccountModel.deleteLiveOrders(connection, customerId);
        await AccountModel.deleteCartAndItems(connection, customerId);
        await AccountModel.deleteFavorites(connection, customerId);
        await AccountModel.deleteCustomer(connection, customerId);
        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async function testRollback(connection, customerId) {
    await connection.beginTransaction();
    try {
        const orders = await AccountModel.findOrdersByCustomerId(
            connection,
            customerId
        );
        const archivedOrderId = await AccountModel.archiveOrder(
            connection,
            orders[0]
        );
        if (!archivedOrderId) {
            throw new Error("archive insert failed");
        }
        throw new Error("forced rollback");
    } catch (error) {
        await connection.rollback();
        if (error.message !== "forced rollback") {
            throw error;
        }
    }

    const liveCustomers = await count(
        connection,
        "SELECT COUNT(*) c FROM customers WHERE id = ?",
        [customerId]
    );
    const archiveCount = await count(
        connection,
        "SELECT COUNT(*) c FROM deleted_customer_orders WHERE original_customer_id = ?",
        [customerId]
    );

    if (liveCustomers !== 1 || archiveCount !== 0) {
        throw new Error("Rollback did not restore original state");
    }
}

async function run() {
    const connection = await db.getConnection();
    const email = `delete-archive-test-${Date.now()}@example.com`;
    let customerId;

    try {
        const variants = await pickCatalog(connection);
        customerId = await createTestCustomer(connection, email);
        const seeded = await seedCustomerData(connection, customerId, variants);

        await testRollback(connection, customerId);

        await runDeleteFlow(customerId);

        const results = {
            customers: await count(connection, "SELECT COUNT(*) c FROM customers WHERE id = ?", [customerId]),
            orders: await count(connection, "SELECT COUNT(*) c FROM orders WHERE customer_id = ?", [customerId]),
            orderItems: await count(connection, "SELECT COUNT(*) c FROM order_items WHERE order_id IN (?)", [seeded.orderIds]),
            carts: await count(connection, "SELECT COUNT(*) c FROM customer_carts WHERE customer_id = ?", [customerId]),
            favorites: await count(connection, "SELECT COUNT(*) c FROM customer_favorites WHERE customer_id = ?", [customerId]),
            archivedOrders: await count(connection, "SELECT COUNT(*) c FROM deleted_customer_orders WHERE original_customer_id = ?", [customerId]),
            archivedItems: await count(connection, `
                SELECT COUNT(*) c
                FROM deleted_customer_order_items i
                INNER JOIN deleted_customer_orders o ON o.id = i.deleted_customer_order_id
                WHERE o.original_customer_id = ?
            `, [customerId]),
            products: await count(connection, "SELECT COUNT(*) c FROM products WHERE id IN (?)", [seeded.productIds]),
            variants: await count(connection, "SELECT COUNT(*) c FROM product_variants WHERE id IN (?)", [seeded.variantIds]),
            categories: await count(connection, "SELECT COUNT(*) c FROM categories")
        };

        const [archived] = await connection.query(`
            SELECT payment_method, payment_status, razorpay_order_id, razorpay_payment_id, razorpay_signature
            FROM deleted_customer_orders
            WHERE original_customer_id = ?
        `, [customerId]);

        const secretLeak = JSON.stringify(archived).includes("RAZORPAY_KEY_SECRET")
            || archived.some((row) => Object.values(row).some((value) =>
                String(value || "").includes("RAZORPAY_KEY_SECRET")
            ));

        console.log(JSON.stringify({
            email,
            customerId,
            results,
            archivedPayments: archived,
            secretLeak
        }, null, 2));

        if (
            results.customers !== 0
            || results.orders !== 0
            || results.orderItems !== 0
            || results.carts !== 0
            || results.favorites !== 0
            || results.archivedOrders !== 2
            || results.archivedItems !== seeded.expectedArchivedItems
            || results.products !== seeded.productIds.length
            || results.variants !== seeded.variantIds.length
            || results.categories < 1
            || secretLeak
        ) {
            throw new Error("Delete account verification failed");
        }

        console.log("DELETE ACCOUNT + ARCHIVE TEST PASSED");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

run();
