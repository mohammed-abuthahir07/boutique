const db = require("../../config/database");

const ProductModel = {

    // Get all products
    async findAll() {
        const [rows] = await db.query(`
            SELECT
                p.id,
                p.category_id,
                c.name AS category_name,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.image,
                p.status,
                p.created_at,
                p.updated_at
            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.id DESC
        `);

        return rows;
    },


    // Get product by ID
    async findById(id) {
        const [rows] = await db.query(
            `
            SELECT
                p.id,
                p.category_id,
                c.name AS category_name,
                p.name,
                p.description,
                p.price,
                p.stock,
                p.image,
                p.status,
                p.created_at,
                p.updated_at
            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            WHERE p.id = ?
            LIMIT 1
            `,
            [id]
        );

        return rows[0] || null;
    },


    // Check category
    async findCategoryById(categoryId) {
        const [rows] = await db.query(
            `
            SELECT
                id,
                name,
                status
            FROM categories
            WHERE id = ?
            LIMIT 1
            `,
            [categoryId]
        );

        return rows[0] || null;
    },


    // Create product
    async create({
        category_id,
        name,
        description,
        price,
        stock,
        image
    }) {
        const [result] = await db.query(
            `
            INSERT INTO products
                (
                    category_id,
                    name,
                    description,
                    price,
                    stock,
                    image,
                    status
                )
            VALUES
                (?, ?, ?, ?, ?, ?, 'ACTIVE')
            `,
            [
                category_id,
                name,
                description,
                price,
                stock,
                image
            ]
        );

        return result.insertId;
    },


    // Update product
    async update(
        id,
        {
            category_id,
            name,
            description,
            price,
            stock,
            image,
            status
        }
    ) {
        await db.query(
            `
            UPDATE products
            SET
                category_id = ?,
                name = ?,
                description = ?,
                price = ?,
                stock = ?,
                image = ?,
                status = ?
            WHERE id = ?
            `,
            [
                category_id,
                name,
                description,
                price,
                stock,
                image,
                status,
                id
            ]
        );
    },


    // Delete product
    async delete(id) {
        const [result] = await db.query(
            `
            DELETE FROM products
            WHERE id = ?
            `,
            [id]
        );

        return result.affectedRows;
    }
};

module.exports = ProductModel;