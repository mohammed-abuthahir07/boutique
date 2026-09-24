const db = require("../../config/database");

const CategoryModel = {

    // ==========================================
    // GET ALL CATEGORIES
    // ==========================================

    async findAll() {
        const [rows] = await db.query(`
            SELECT
                id,
                name,
                slug,
                image,
                status,
                created_at,
                updated_at
            FROM categories
            ORDER BY id DESC
        `);

        return rows;
    },


    // ==========================================
    // GET CATEGORY BY ID
    // ==========================================

    async findById(id) {
        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                slug,
                image,
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


    // ==========================================
    // FIND CATEGORY BY NAME
    // ==========================================

    async findByName(name) {
        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                slug,
                image,
                status
            FROM categories
            WHERE name = ?
            LIMIT 1
            `,
            [name]
        );

        return rows[0] || null;
    },


    // ==========================================
    // FIND CATEGORY BY SLUG
    // ==========================================

    async findBySlug(slug) {
        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                slug,
                image,
                status
            FROM categories
            WHERE slug = ?
            LIMIT 1
            `,
            [slug]
        );

        return rows[0] || null;
    },


    // ==========================================
    // CREATE CATEGORY
    // ==========================================

    async create({ name, slug, image }) {
        const [result] = await db.query(
            `
            INSERT INTO categories
            (
                name,
                slug,
                image,
                status
            )
            VALUES
            (
                ?,
                ?,
                ?,
                'ACTIVE'
            )
            `,
            [
                name,
                slug,
                image
            ]
        );

        return result.insertId;
    },


    // ==========================================
    // UPDATE CATEGORY
    // ==========================================

    async update(
        id,
        {
            name,
            slug,
            image,
            status
        }
    ) {
        await db.query(
            `
            UPDATE categories
            SET
                name = ?,
                slug = ?,
                image = ?,
                status = ?
            WHERE id = ?
            `,
            [
                name,
                slug,
                image,
                status,
                id
            ]
        );
    },


    // ==========================================
    // DELETE CATEGORY
    // ==========================================

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