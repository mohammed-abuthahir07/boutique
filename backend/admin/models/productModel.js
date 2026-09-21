const db = require("../../config/database");

const ProductModel = {

    // Get all products with variants
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
            product.variants = await this.findVariantsByProductId(product.id);
        }

        return rows;
    },


    // Get product by ID with variants
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
            await this.findVariantsByProductId(product.id);

        return product;
    },


    // Get variants of a product
    async findVariantsByProductId(productId) {
        const [rows] = await db.query(
            `
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
            `,
            [productId]
        );

        return rows;
    },


    // Get one variant
    async findVariantById(variantId) {
        const [rows] = await db.query(
            `
            SELECT
                id,
                product_id,
                color,
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


    // Create variant
    async createVariant({
        product_id,
        color,
        stock
    }) {
        const [result] = await db.query(
            `
            INSERT INTO product_variants
                (
                    product_id,
                    color,
                    stock
                )
            VALUES
                (?, ?, ?)
            `,
            [
                product_id,
                color,
                stock
            ]
        );

        return result.insertId;
    },


    // Update variant
    async updateVariant(
        variantId,
        {
            color,
            stock
        }
    ) {
        await db.query(
            `
            UPDATE product_variants
            SET
                color = ?,
                stock = ?
            WHERE id = ?
            `,
            [
                color,
                stock,
                variantId
            ]
        );
    },


    // Delete variant
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