const db = require("../../config/database");

const OfferModel = {

    async findAll() {
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
            ORDER BY id DESC
        `);

        return rows;
    },

    async findById(id) {
        const [rows] = await db.query(
            `
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
            LIMIT 1
            `,
            [id]
        );

        return rows[0] || null;
    },

    async create({
        title,
        description,
        image,
        discount_type,
        discount_value,
        start_date,
        end_date
    }) {
        const [result] = await db.query(
            `
            INSERT INTO offers
                (
                    title,
                    description,
                    image,
                    discount_type,
                    discount_value,
                    start_date,
                    end_date,
                    status
                )
            VALUES
                (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
            `,
            [
                title,
                description,
                image,
                discount_type,
                discount_value,
                start_date,
                end_date
            ]
        );

        return result.insertId;
    },

    async update(
        id,
        {
            title,
            description,
            image,
            discount_type,
            discount_value,
            start_date,
            end_date,
            status
        }
    ) {
        await db.query(
            `
            UPDATE offers
            SET
                title = ?,
                description = ?,
                image = ?,
                discount_type = ?,
                discount_value = ?,
                start_date = ?,
                end_date = ?,
                status = ?
            WHERE id = ?
            `,
            [
                title,
                description,
                image,
                discount_type,
                discount_value,
                start_date,
                end_date,
                status,
                id
            ]
        );
    },

    async delete(id) {
        const [result] = await db.query(
            `
            DELETE FROM offers
            WHERE id = ?
            `,
            [id]
        );

        return result.affectedRows;
    }
};

module.exports = OfferModel;