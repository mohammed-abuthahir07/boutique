const db = require("../../config/database");

const ProfileModel = {

    async findById(customerId) {
        const [rows] = await db.query(`
            SELECT
                id,
                name,
                email,
                phone,
                profile_image,
                status,
                created_at,
                updated_at
            FROM customers
            WHERE id = ?
            LIMIT 1
        `, [customerId]);

        return rows[0];
    },

    async updateProfile(customerId, {
        name,
        phone,
        profileImage
    }) {

        await db.query(`
            UPDATE customers
            SET
                name = ?,
                phone = ?,
                profile_image = ?
            WHERE id = ?
        `, [
            name,
            phone,
            profileImage,
            customerId
        ]);

        return this.findById(customerId);
    }

};

module.exports = ProfileModel;  