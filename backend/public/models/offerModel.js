const db = require("../../config/database");

const OfferModel = {

    async findActiveOffers() {
        const [rows] = await db.query(`
            SELECT
                id,
                title,
                description,
                image,
                discount_type,
                discount_value,
                start_date,
                end_date,
                status,
                created_at,
                updated_at
            FROM offers
            WHERE status = 'ACTIVE'
            ORDER BY created_at DESC
        `);

        return rows;
    },

    async findActiveOfferById(id) {
        const [rows] = await db.query(`
            SELECT
                id,
                title,
                description,
                image,
                discount_type,
                discount_value,
                start_date,
                end_date,
                status,
                created_at,
                updated_at
            FROM offers
            WHERE id = ?
              AND status = 'ACTIVE'
            LIMIT 1
        `, [id]);

        return rows[0];
    }

};

module.exports = OfferModel;