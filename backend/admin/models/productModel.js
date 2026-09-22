const db = require("../../config/database");

const ProductModel = {

    // =====================================================
    // GET ALL PRODUCTS
    // =====================================================

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

        for (const product of rows) {

            product.variants =
                await this.findVariantsByProductId(
                    product.id
                );

            product.colors =
                await this.findColorImagesByProductId(
                    product.id
                );
        }

        return rows;
    },


    // =====================================================
    // GET PRODUCT BY ID
    // =====================================================

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

        if (!rows[0]) {
            return null;
        }

        const product = rows[0];

        product.variants =
            await this.findVariantsByProductId(
                product.id
            );

        product.color_images =
            await this.findColorImagesByProductId(
                product.id
            );

        return product;
    },


    // =====================================================
    // GET VARIANTS
    // =====================================================

    async findVariantsByProductId(productId) {

        const [rows] = await db.query(
            `
            SELECT
                id,
                product_id,
                color,
                size,
                stock,
                created_at,
                updated_at
            FROM product_variants
            WHERE product_id = ?
            ORDER BY id ASC
            `,
            [productId]
        );

        return rows;
    },


    // =====================================================
    // GET ONE VARIANT
    // =====================================================

    async findVariantById(variantId) {

        const [rows] = await db.query(
            `
            SELECT
                id,
                product_id,
                color,
                size,
                stock,
                created_at,
                updated_at
            FROM product_variants
            WHERE id = ?
            LIMIT 1
            `,
            [variantId]
        );

        return rows[0] || null;
    },


    // =====================================================
    // CREATE VARIANT
    // =====================================================

    async createVariant({
        product_id,
        color,
        size,
        stock
    }) {

        const [result] = await db.query(
            `
            INSERT INTO product_variants
            (
                product_id,
                color,
                size,
                stock
            )
            VALUES
            (?, ?, ?, ?)
            `,
            [
                product_id,
                color,
                size,
                stock
            ]
        );

        return result.insertId;
    },


    // =====================================================
    // UPDATE VARIANT
    // =====================================================

    async updateVariant(
        variantId,
        {
            color,
            size,
            stock
        }
    ) {

        await db.query(
            `
            UPDATE product_variants
            SET
                color = ?,
                size = ?,
                stock = ?
            WHERE id = ?
            `,
            [
                color,
                size,
                stock,
                variantId
            ]
        );
    },


    // =====================================================
    // DELETE VARIANT
    // =====================================================

    async deleteVariant(variantId) {

        const [result] = await db.query(
            `
            DELETE FROM product_variants
            WHERE id = ?
            `,
            [variantId]
        );

        return result.affectedRows;
    },


    // =====================================================
    // FIND CATEGORY
    // =====================================================

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


    // =====================================================
    // CREATE PRODUCT
    // =====================================================

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


    // =====================================================
    // UPDATE PRODUCT
    // =====================================================

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


    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    async delete(id) {

        const [result] = await db.query(
            `
            DELETE FROM products
            WHERE id = ?
            `,
            [id]
        );

        return result.affectedRows;
    },


    // =====================================================
    // COLOR IMAGES
    // =====================================================

    async findColorImagesByProductId(productId) {

        const [rows] = await db.query(
            `
            SELECT
                id,
                product_id,
                color,
                image,
                sort_order,
                created_at
            FROM product_color_images
            WHERE product_id = ?
            ORDER BY color ASC, sort_order ASC, id ASC
            `,
            [productId]
        );

        return rows;
    },


    // =====================================================
    // GET COLOR IMAGES
    // =====================================================

    async findColorImages(
        productId,
        color
    ) {

        const [rows] = await db.query(
            `
            SELECT
                id,
                product_id,
                color,
                image,
                sort_order,
                created_at
            FROM product_color_images
            WHERE product_id = ?
              AND LOWER(color) = LOWER(?)
            ORDER BY sort_order ASC, id ASC
            `,
            [
                productId,
                color
            ]
        );

        return rows;
    },


    // =====================================================
    // CREATE COLOR IMAGE
    // =====================================================

    async createColorImage({
        product_id,
        color,
        image,
        sort_order
    }) {

        const [result] = await db.query(
            `
            INSERT INTO product_color_images
            (
                product_id,
                color,
                image,
                sort_order
            )
            VALUES
            (?, ?, ?, ?)
            `,
            [
                product_id,
                color,
                image,
                sort_order
            ]
        );

        return result.insertId;
    },


    // =====================================================
    // DELETE COLOR IMAGE
    // =====================================================

    async deleteColorImage(imageId) {

        const [result] = await db.query(
            `
            DELETE FROM product_color_images
            WHERE id = ?
            `,
            [imageId]
        );

        return result.affectedRows;
    },


    // =====================================================
    // FIND COLOR IMAGE BY ID
    // =====================================================

    async findColorImageById(imageId) {

        const [rows] = await db.query(
            `
            SELECT
                id,
                product_id,
                color,
                image,
                sort_order
            FROM product_color_images
            WHERE id = ?
            LIMIT 1
            `,
            [imageId]
        );

        return rows[0] || null;
    }

};

module.exports = ProductModel;