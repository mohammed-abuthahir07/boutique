const db = require("../../config/database");

const CategoryModel = {
    // Get all categories
    async findAll() {
        const [rows] = await db.query(`
            SELECT
                id,
                name,
                slug,
                status,
                created_at,
                updated_at
            FROM categories
            ORDER BY id DESC
        `);

        return rows;
    },

    // Get category by ID
    async findById(id) {
        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                slug,
                status,
                created_at,
                updated_at
            FROM categories
            WHERE id = ?
            LIMIT 1
            `,
            [id]
        );

        return rows[0] || null;
    },

    // Find category by name
    async findByName(name) {
        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                slug,
                status
            FROM categories
            WHERE name = ?
            LIMIT 1
            `,
            [name]
        );

        return rows[0] || null;
    },

    // Find category by slug
    async findBySlug(slug) {
        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                slug,
                status
            FROM categories
            WHERE slug = ?
            LIMIT 1
            `,
            [slug]
        );

        return rows[0] || null;
    },

    // Create category
    async create({ name, slug }) {
        const [result] = await db.query(
            `
            INSERT INTO categories
                (name, slug, status)
            VALUES
                (?, ?, 'ACTIVE')
            `,
            [name, slug]
        );

        return result.insertId;
    },

    // Update category
    async update(id, { name, slug, status }) {
        await db.query(
            `
            UPDATE categories
            SET
                name = ?,
                slug = ?,
                status = ?
            WHERE id = ?
            `,
            [name, slug, status, id]
        );
    },

    // Delete category
    async delete(id) {
        const [result] = await db.query(
            `
            DELETE FROM categories
            WHERE id = ?
            `,
            [id]
        );

        return result.affectedRows;
    }
};

module.exports = CategoryModel;