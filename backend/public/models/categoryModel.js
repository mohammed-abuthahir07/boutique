const db = require("../../config/database");

const CategoryModel = {

    async findActive() {
        const [rows] = await db.query(`
            SELECT
                id,
                name,
                slug,
                image
            FROM categories
            WHERE status = 'ACTIVE'
            ORDER BY id DESC
        `);

        return rows;
    }

};

module.exports = CategoryModel;
