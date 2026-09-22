const db = require("../../config/database");

const FavoriteModel = {

    async findProduct(productId) {
        const [rows] = await db.query(`
            SELECT
                id,
                name,
                status
            FROM products
            WHERE id = ?
            LIMIT 1
        `, [productId]);

        return rows[0];
    },

    async addFavorite(customerId, productId) {
        const [result] = await db.query(`
            INSERT INTO customer_favorites
            (
                customer_id,
                product_id
            )
            VALUES (?, ?)
        `, [
            customerId,
            productId
        ]);

        return result.insertId;
    },

    async findFavorite(customerId, productId) {
        const [rows] = await db.query(`
            SELECT
                id,
                customer_id,
                product_id,
                created_at
            FROM customer_favorites
            WHERE customer_id = ?
              AND product_id = ?
            LIMIT 1
        `, [
            customerId,
            productId
        ]);

        return rows[0];
    },

    async findAllByCustomerId(customerId) {
        const [rows] = await db.query(`
            SELECT
                f.id,
                f.product_id,
                f.created_at,

                p.category_id,
                c.name AS category_name,
                p.name,
                p.description,
                p.price,
                p.image,
                p.status

            FROM customer_favorites f

            INNER JOIN products p
                ON f.product_id = p.id

            INNER JOIN categories c
                ON p.category_id = c.id

            WHERE f.customer_id = ?
              AND p.status = 'ACTIVE'
              AND c.status = 'ACTIVE'

            ORDER BY f.created_at DESC
        `, [customerId]);

        return rows;
    },

    async deleteFavorite(customerId, productId) {
        const [result] = await db.query(`
            DELETE FROM customer_favorites
            WHERE customer_id = ?
              AND product_id = ?
        `, [
            customerId,
            productId
        ]);

        return result.affectedRows;
    }

};

module.exports = FavoriteModel;