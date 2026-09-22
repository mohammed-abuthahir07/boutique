const db = require("../../config/database");

const CartModel = {

    // =====================================================
    // FIND CUSTOMER CART
    // =====================================================

    async findCartByCustomerId(customerId) {

        const [rows] = await db.query(`
            SELECT
                id,
                customer_id,
                created_at,
                updated_at
            FROM customer_carts
            WHERE customer_id = ?
            LIMIT 1
        `, [customerId]);

        return rows[0];
    },


    // =====================================================
    // CREATE CUSTOMER CART
    // =====================================================

    async createCart(customerId) {

        const [result] = await db.query(`
            INSERT INTO customer_carts
            (
                customer_id
            )
            VALUES (?)
        `, [customerId]);

        return result.insertId;
    },


    // =====================================================
    // FIND PRODUCT + EXACT VARIANT
    // =====================================================
    // Variant is identified by:
    //
    // product_id
    // +
    // variant_id
    //
    // Variant contains:
    // color
    // size
    // stock
    // =====================================================

    async findProductVariant(productId, variantId) {

        const [rows] = await db.query(`
            SELECT
                p.id AS product_id,
                p.name,
                p.description,
                p.price,
                p.image,
                p.status AS product_status,

                c.id AS category_id,
                c.name AS category_name,
                c.status AS category_status,

                pv.id AS variant_id,
                pv.color,
                pv.size,
                pv.stock AS variant_stock

            FROM products p

            INNER JOIN categories c
                ON p.category_id = c.id

            INNER JOIN product_variants pv
                ON pv.product_id = p.id

            WHERE p.id = ?
              AND pv.id = ?

            LIMIT 1
        `, [
            productId,
            variantId
        ]);

        return rows[0];
    },


    // =====================================================
    // FIND EXISTING CART ITEM
    // =====================================================

    async findCartItem(
        cartId,
        productId,
        variantId
    ) {

        const [rows] = await db.query(`
            SELECT
                id,
                cart_id,
                product_id,
                variant_id,
                quantity,
                created_at,
                updated_at
            FROM customer_cart_items
            WHERE cart_id = ?
              AND product_id = ?
              AND variant_id = ?
            LIMIT 1
        `, [
            cartId,
            productId,
            variantId
        ]);

        return rows[0];
    },


    // =====================================================
    // ADD ITEM TO CART
    // =====================================================

    async addCartItem(
        cartId,
        productId,
        variantId,
        quantity
    ) {

        const [result] = await db.query(`
            INSERT INTO customer_cart_items
            (
                cart_id,
                product_id,
                variant_id,
                quantity
            )
            VALUES (?, ?, ?, ?)
        `, [
            cartId,
            productId,
            variantId,
            quantity
        ]);

        return result.insertId;
    },


    // =====================================================
    // UPDATE CART ITEM QUANTITY
    // =====================================================

    async updateCartItemQuantity(
        cartItemId,
        quantity
    ) {

        await db.query(`
            UPDATE customer_cart_items
            SET
                quantity = ?
            WHERE id = ?
        `, [
            quantity,
            cartItemId
        ]);
    },


    // =====================================================
    // GET CUSTOMER CART
    // =====================================================
    // Returns:
    // Product
    // Color
    // Size
    // Variant
    // Stock
    // Quantity
    // Price
    // Subtotal
    // =====================================================

    async getCartItems(customerId) {

        const [rows] = await db.query(`
            SELECT
                ci.id AS cart_item_id,
                ci.product_id,
                ci.variant_id,
                ci.quantity,

                p.name AS product_name,
                p.description,
                p.price,
                p.image,

                pv.color,
                pv.size,
                pv.stock AS available_stock,

                (
                    p.price * ci.quantity
                ) AS subtotal

            FROM customer_cart_items ci

            INNER JOIN customer_carts cc
                ON ci.cart_id = cc.id

            INNER JOIN products p
                ON ci.product_id = p.id

            INNER JOIN product_variants pv
                ON ci.variant_id = pv.id

            WHERE cc.customer_id = ?

            ORDER BY ci.created_at DESC
        `, [customerId]);

        return rows;
    },


    // =====================================================
    // FIND CART ITEM BY ID
    // =====================================================
    // Customer ownership is checked here.
    // =====================================================

    async findCartItemById(
        customerId,
        cartItemId
    ) {

        const [rows] = await db.query(`
            SELECT
                ci.id,
                ci.cart_id,
                ci.product_id,
                ci.variant_id,
                ci.quantity

            FROM customer_cart_items ci

            INNER JOIN customer_carts cc
                ON ci.cart_id = cc.id

            WHERE ci.id = ?
              AND cc.customer_id = ?

            LIMIT 1
        `, [
            cartItemId,
            customerId
        ]);

        return rows[0];
    },


    // =====================================================
    // DELETE CART ITEM
    // =====================================================

    async deleteCartItem(
        customerId,
        cartItemId
    ) {

        const [result] = await db.query(`
            DELETE ci
            FROM customer_cart_items ci

            INNER JOIN customer_carts cc
                ON ci.cart_id = cc.id

            WHERE ci.id = ?
              AND cc.customer_id = ?
        `, [
            cartItemId,
            customerId
        ]);

        return result.affectedRows;
    },


    // =====================================================
    // CLEAR CUSTOMER CART
    // =====================================================

    async clearCart(customerId) {

        const [result] = await db.query(`
            DELETE ci
            FROM customer_cart_items ci

            INNER JOIN customer_carts cc
                ON ci.cart_id = cc.id

            WHERE cc.customer_id = ?
        `, [customerId]);

        return result.affectedRows;
    }

};

module.exports = CartModel;