const db = require("../../config/database");

const AdminModel = {
    async findByEmail(email) {
        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                email,
                password,
                role,
                status,
                created_at,
                updated_at
            FROM admins
            WHERE email = ?
            LIMIT 1
            `,
            [email]
        );

        return rows[0] || null;
    },

    async findById(id) {
        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                email,
                role,
                status,
                created_at,
                updated_at
            FROM admins
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        return rows[0] || null;
    },

    async create({ name, email, password, role = "ADMIN" }) {
        const [result] = await db.query(
            `
            INSERT INTO admins
                (name, email, password, role, status)
            VALUES
                (?, ?, ?, ?, 'ACTIVE')
            `,
            [name, email, password, role]
        );

        return result.insertId;
    },

    async updateLastLogin(id) {
        await db.query(
            `
            UPDATE admins
            SET updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `,
            [id]
        );
    }
};

module.exports = AdminModel;