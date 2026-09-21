const db = require("../../config/database");

const CustomerAuthModel = {

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

    async findByGoogleId(googleId) {
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
            WHERE google_id = ?
            LIMIT 1
        `, [googleId]);

        return rows[0];
    },

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

    async create({
        name,
        email,
        phone,
        password,
        google_id
    }) {
        const [result] = await db.query(`
            INSERT INTO customers
            (
                name,
                email,
                phone,
                password,
                google_id
            )
            VALUES (?, ?, ?, ?, ?)
        `, [
            name,
            email,
            phone,
            password,
            google_id
        ]);

        return result.insertId;
    },

    async updateGoogleId(customerId, googleId) {
        await db.query(`
            UPDATE customers
            SET google_id = ?
            WHERE id = ?
        `, [
            googleId,
            customerId
        ]);
    }

};

module.exports = CustomerAuthModel;