const db = require("../config/database");

async function migrate() {
    const [cols] = await db.query("SHOW COLUMNS FROM orders");
    const names = cols.map((c) => c.Field);

    const needed = [
        ["payment_method", "VARCHAR(20) NOT NULL DEFAULT 'DIRECT'"],
        ["payment_status", "VARCHAR(20) NOT NULL DEFAULT 'PENDING'"],
        ["razorpay_order_id", "VARCHAR(100) NULL"],
        ["razorpay_payment_id", "VARCHAR(100) NULL"],
        ["razorpay_signature", "VARCHAR(255) NULL"],
    ];

    for (const [name, def] of needed) {
        if (!names.includes(name)) {
            await db.query(`ALTER TABLE orders ADD COLUMN ${name} ${def}`);
            console.log("added", name);
        } else {
            console.log("exists", name);
        }
    }

    const [idx] = await db.query(
        "SHOW INDEX FROM orders WHERE Key_name = 'uniq_razorpay_payment_id'"
    );

    if (!idx.length) {
        await db.query(
            "ALTER TABLE orders ADD UNIQUE KEY uniq_razorpay_payment_id (razorpay_payment_id)"
        );
        console.log("added unique index");
    } else {
        console.log("index exists");
    }

    process.exit(0);
}

migrate().catch((error) => {
    console.error(error);
    process.exit(1);
});
