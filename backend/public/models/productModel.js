const db = require("../../config/database");

const ProductModel = {

    async findAll() {
        const [rows] = await db.query(`
            SELECT
                p.id,
                p.category_id,
                c.name AS category_name,
                p.name,
                p.description,
                p.price,
                p.image,
                p.status,
                p.created_at,
                p.updated_at
            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            WHERE p.status = 'ACTIVE'
              AND c.status = 'ACTIVE'
            ORDER BY p.created_at DESC
        `);

        return rows;
    },

    async findById(id) {
        const [rows] = await db.query(`
            SELECT
                p.id,
                p.category_id,
                c.name AS category_name,
                p.name,
                p.description,
                p.price,
                p.image,
                p.status,
                p.created_at,
                p.updated_at
            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            WHERE p.id = ?
              AND p.status = 'ACTIVE'
              AND c.status = 'ACTIVE'
            LIMIT 1
        `, [id]);

        return rows[0];
    },

    async findVariantsByProductId(productId) {
        const [rows] = await db.query(`
            SELECT
                id,
                product_id,
                color,
                stock,
                created_at,
                updated_at
            FROM product_variants
            WHERE product_id = ?
            ORDER BY id ASC
        `, [productId]);

        return rows;
    }

};

module.exports = ProductModel;