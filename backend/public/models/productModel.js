const db = require("../../config/database");

const ProductModel = {

    // =====================================================
    // GET ALL PUBLIC PRODUCTS
    // =====================================================
    // IMPORTANT:
    // This method returns ONLY basic product information.
    //
    // It does NOT load:
    // - variants
    // - sizes
    // - stock
    // - color images
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


    // =====================================================
    // GET SINGLE PUBLIC PRODUCT
    // =====================================================
    // This method returns the COMPLETE product.
    //
    // Includes:
    // - Basic product information
    // - Variants
    // - Color
    // - Size
    // - Stock
    // - Color images
    // =====================================================

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


        if (!rows[0]) {
            return null;
        }


        const product = rows[0];


        // Get complete product variants
        product.variants =
            await this.findVariantsByProductId(
                product.id
            );


        // Get all color-specific images
        product.color_images =
            await this.findColorImagesByProductId(
                product.id
            );


        return product;
    },


    // =====================================================
    // GET PRODUCT VARIANTS
    // =====================================================

    async findVariantsByProductId(productId) {

        const [rows] = await db.query(`
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
        `, [productId]);


        return rows;
    },


    // =====================================================
    // GET PRODUCT COLOR IMAGES
    // =====================================================

    async findColorImagesByProductId(productId) {

        const [rows] = await db.query(`
            SELECT
                id,
                product_id,
                color,
                image,
                sort_order,
                created_at

            FROM product_color_images

            WHERE product_id = ?

            ORDER BY
                color ASC,
                sort_order ASC,
                id ASC
        `, [productId]);


        return rows;
    },


    // =====================================================
    // GET IMAGES FOR A SPECIFIC COLOR
    // =====================================================

    async findColorImages(productId, color) {

        const [rows] = await db.query(`
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

            ORDER BY
                sort_order ASC,
                id ASC
        `, [
            productId,
            color
        ]);


        return rows;
    }

};


module.exports = ProductModel;