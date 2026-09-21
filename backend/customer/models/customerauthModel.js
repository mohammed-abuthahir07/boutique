const db = require("../../config/database");

const CustomerAuthModel = {

    // Find customer by email
    async findByEmail(email) {
        const [rows] = await db.query(`
            SELECT
                id,
                name,
                email,
                phone,
                password,
                google_id,
                status,
                created_at,
                updated_at
            FROM customers
            WHERE email = ?
            LIMIT 1
        `, [email]);

        return rows[0];
    },


    // Find customer by ID
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


    // Create customer
    async create({
        name,
        email,
        phone,
        password
    }) {
        const [result] = await db.query(`
            INSERT INTO customers
            (
                name,
                email,
                phone,
                password
            )
            VALUES (?, ?, ?, ?)
        `, [
            name,
            email,
            phone,
            password
        ]);

        return result.insertId;
    }

};

module.exports = CustomerAuthModel;