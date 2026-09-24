const db = require("../config/database");

async function request(path, { method = "GET", token, body } = {}) {
    const res = await fetch(`http://localhost:5000${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

async function run() {
    const login = await request("/api/admin/auth/login", {
        method: "POST",
        body: { email: "admin@boutique.com", password: "Admin@123" }
    });

    if (!login.data.token) {
        throw new Error(`Admin login failed: ${JSON.stringify(login.data)}`);
    }

    const token = login.data.token;

    const unauth = await request("/api/admin/deleted-customers");
    if (unauth.status !== 401) {
        throw new Error(`Expected 401 without token, got ${unauth.status}`);
    }

    const list = await request("/api/admin/deleted-customers", { token });
    if (!list.data.success) {
        throw new Error(`List failed: ${JSON.stringify(list.data)}`);
    }

    const ids = list.data.customers.map((row) => row.original_customer_id);
    const unique = new Set(ids);
    if (ids.length !== unique.size) {
        throw new Error("Deleted customers list is not grouped by original_customer_id");
    }

    const payload = JSON.stringify(list.data);
    if (payload.includes("RAZORPAY_KEY_SECRET")) {
        throw new Error("Secret leaked in list response");
    }

    const live = await request("/api/admin/customers", { token });
    const liveIds = new Set((live.data.customers || []).map((row) => row.id));
    for (const id of ids) {
        if (liveIds.has(id)) {
            throw new Error(`Deleted customer ${id} still appears in live directory`);
        }
    }

    if (!ids.length) {
        console.log("ADMIN DELETED CUSTOMERS LIST EMPTY — skip detail/delete assertions");
        process.exit(0);
    }

    const customerId = ids[0];
    const details = await request(`/api/admin/deleted-customers/${customerId}`, { token });
    if (details.status !== 200 || !details.data.customer) {
        throw new Error(`Details failed: ${JSON.stringify(details.data)}`);
    }

    const order = details.data.orders[0];
    const orderRes = await request(
        `/api/admin/deleted-customers/${customerId}/orders/${order.id}`,
        { token }
    );
    if (orderRes.status !== 200 || !orderRes.data.order) {
        throw new Error(`Order details failed: ${JSON.stringify(orderRes.data)}`);
    }

    const otherCustomer = ids[1] || customerId + 999999;
    const mismatch = await request(
        `/api/admin/deleted-customers/${otherCustomer}/orders/${order.id}`,
        { token }
    );
    if (mismatch.status !== 404 && otherCustomer !== customerId) {
        throw new Error("Cross-customer archived order access was allowed");
    }

    const [productsBefore] = await db.query("SELECT COUNT(*) AS c FROM products");
    const [variantsBefore] = await db.query("SELECT COUNT(*) AS c FROM product_variants");
    const [liveCustomersBefore] = await db.query("SELECT COUNT(*) AS c FROM customers");
    const [liveOrdersBefore] = await db.query("SELECT COUNT(*) AS c FROM orders");

    const del = await request(`/api/admin/deleted-customers/${customerId}`, {
        method: "DELETE",
        token
    });
    if (del.status !== 200 || !del.data.success) {
        throw new Error(`Permanent delete failed: ${JSON.stringify(del.data)}`);
    }

    const after = await request(`/api/admin/deleted-customers/${customerId}`, { token });
    if (after.status !== 404) {
        throw new Error(`Expected 404 after permanent delete, got ${after.status}`);
    }

    const [archiveOrders] = await db.query(
        "SELECT id FROM deleted_customer_orders WHERE original_customer_id = ?",
        [customerId]
    );
    const [archiveItems] = await db.query(`
        SELECT i.id
        FROM deleted_customer_order_items i
        INNER JOIN deleted_customer_orders o ON o.id = i.deleted_customer_order_id
        WHERE o.original_customer_id = ?
    `, [customerId]);

    const [productsAfter] = await db.query("SELECT COUNT(*) AS c FROM products");
    const [variantsAfter] = await db.query("SELECT COUNT(*) AS c FROM product_variants");
    const [liveCustomersAfter] = await db.query("SELECT COUNT(*) AS c FROM customers");
    const [liveOrdersAfter] = await db.query("SELECT COUNT(*) AS c FROM orders");

    if (archiveOrders.length || archiveItems.length) {
        throw new Error("Archive rows still exist after permanent delete");
    }
    if (productsBefore[0].c !== productsAfter[0].c) {
        throw new Error("Products were affected");
    }
    if (variantsBefore[0].c !== variantsAfter[0].c) {
        throw new Error("Variants were affected");
    }
    if (liveCustomersBefore[0].c !== liveCustomersAfter[0].c) {
        throw new Error("Live customers were affected");
    }
    if (liveOrdersBefore[0].c !== liveOrdersAfter[0].c) {
        throw new Error("Live orders were affected");
    }

    console.log("ADMIN DELETED CUSTOMERS API TEST PASSED", {
        remainingArchivedCustomers: ids.length - 1,
        deletedCustomerId: customerId
    });
    process.exit(0);
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
