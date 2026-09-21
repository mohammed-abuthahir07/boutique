const db = require("../../config/database");

const InventoryModel = {

    // Get stock information for all products
    async getInventory() {

        const [rows] = await db.query(`
            SELECT
                p.id,
                p.name AS product_name,
                c.name AS category_name,
                p.price,
                p.stock,
                p.status,
                p.created_at,
                p.updated_at
            FROM products p
            INNER JOIN categories c
                ON p.category_id = c.id
            ORDER BY p.stock ASC, p.name ASC
        `);

        return rows;
    }

};

module.exports = InventoryModel;