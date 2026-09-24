const bcrypt = require("bcryptjs");
const db = require("../config/database");
const AccountModel = require("../customer/models/accountModel");

async function run() {
    const connection = await db.getConnection();
    const email = `delete-no-orders-${Date.now()}@example.com`;
    const password = await bcrypt.hash("TestDelete123!", 10);

    try {
        const [created] = await connection.query(`
            INSERT INTO customers (name, email, phone, password, status)
            VALUES (?, ?, ?, ?, 'ACTIVE')
        `, ["No Orders Customer", email, "9000000000", password]);

        const customerId = created.insertId;

        const [fav] = await connection.query(`
            INSERT INTO customer_favorites (customer_id, product_id)
            SELECT ?, id FROM products WHERE status = 'ACTIVE' LIMIT 1
        `, [customerId]);

        if (!fav.affectedRows) {
            throw new Error("Could not add favorite");
        }

        await runDeleteFlow(customerId);

        const [customers] = await connection.query("SELECT id FROM customers WHERE id = ?", [customerId]);
        const [archives] = await connection.query("SELECT id FROM deleted_customer_orders WHERE original_customer_id = ?", [customerId]);
        const [favs] = await connection.query("SELECT id FROM customer_favorites WHERE customer_id = ?", [customerId]);

        if (customers.length || archives.length || favs.length) {
            throw new Error("No-orders delete verification failed");
        }

        console.log("NO-ORDERS DELETE TEST PASSED", { customerId });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        connection.release();
    }
}

async function runDeleteFlow(customerId) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const customer = await AccountModel.findById(connection, customerId);
        if (!customer) throw new Error("Customer not found");
        const orders = await AccountModel.findOrdersByCustomerId(connection, customerId);
        if (orders.length) throw new Error("Expected no orders");
        await AccountModel.deleteLiveOrderItems(connection, []);
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

run();
