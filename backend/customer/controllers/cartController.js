const CartModel = require("../models/cartModel");

const CartController = {

    // =====================================================
    // ADD TO CART
    // =====================================================

    async addToCart(req, res) {

        try {

            // NEVER take customer_id from frontend
            const customerId = req.customer.id;

            const productId =
                Number(req.body.product_id);

            const variantId =
                Number(req.body.variant_id);

            const quantity =
                Number(req.body.quantity);


            // =================================================
            // VALIDATION
            // =================================================

            if (
                !Number.isInteger(productId) ||
                productId <= 0 ||
                !Number.isInteger(variantId) ||
                variantId <= 0 ||
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "product_id, variant_id and a valid quantity are required"
                });
            }


            // =================================================
            // FIND EXACT PRODUCT VARIANT
            // =================================================

            const product =
                await CartModel.findProductVariant(
                    productId,
                    variantId
                );


            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product or selected variant not found"
                });
            }


            // =================================================
            // PRODUCT STATUS
            // =================================================

            if (
                product.product_status !== "ACTIVE"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "This product is not available"
                });
            }


            // =================================================
            // CATEGORY STATUS
            // =================================================

            if (
                product.category_status !== "ACTIVE"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "This product category is not available"
                });
            }


            // =================================================
            // VARIANT STOCK
            // =================================================

            if (
                product.variant_stock <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Selected ${product.color} / ${product.size} variant is out of stock`
                });
            }


            if (
                quantity > product.variant_stock
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Only ${product.variant_stock} item(s) available for ${product.color} / ${product.size}`
                });
            }


            // =================================================
            // FIND CUSTOMER CART
            // =================================================

            let cart =
                await CartModel.findCartByCustomerId(
                    customerId
                );


            // =================================================
            // CREATE CART IF NOT EXISTS
            // =================================================

            if (!cart) {

                const cartId =
                    await CartModel.createCart(
                        customerId
                    );

                cart = {
                    id: cartId
                };
            }


            // =================================================
            // CHECK EXISTING SAME VARIANT
            // =================================================

            const existingItem =
                await CartModel.findCartItem(
                    cart.id,
                    productId,
                    variantId
                );


            // =================================================
            // UPDATE EXISTING ITEM
            // =================================================

            if (existingItem) {

                const newQuantity =
                    Number(existingItem.quantity) +
                    quantity;


                if (
                    newQuantity >
                    product.variant_stock
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            `Only ${product.variant_stock} item(s) available for ${product.color} / ${product.size}`
                    });
                }


                await CartModel.updateCartItemQuantity(
                    existingItem.id,
                    newQuantity
                );


                return res.json({
                    success: true,
                    message:
                        "Cart quantity updated successfully",

                    cart_item: {
                        id: existingItem.id,
                        product_id: product.product_id,
                        variant_id: product.variant_id,
                        color: product.color,
                        size: product.size,
                        quantity: newQuantity
                    }
                });
            }


            // =================================================
            // ADD NEW CART ITEM
            // =================================================

            const cartItemId =
                await CartModel.addCartItem(
                    cart.id,
                    productId,
                    variantId,
                    quantity
                );


            return res.status(201).json({

                success: true,

                message:
                    "Product variant added to cart successfully",

                cart_item: {
                    id: cartItemId,
                    product_id: product.product_id,
                    variant_id: product.variant_id,
                    color: product.color,
                    size: product.size,
                    quantity
                }
            });


        } catch (error) {

            console.error(
                "Add to cart error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to add product to cart",
                error: error.message
            });
        }
    },


    // =====================================================
    // GET CART
    // =====================================================

    async getCart(req, res) {

        try {

            // Customer comes from JWT
            const customerId =
                req.customer.id;


            const items =
                await CartModel.getCartItems(
                    customerId
                );


            let subtotal = 0;


            const cartItems =
                items.map(item => {

                    const itemSubtotal =
                        Number(item.price) *
                        Number(item.quantity);


                    subtotal += itemSubtotal;


                    return {

                        cart_item_id:
                            item.cart_item_id,

                        product_id:
                            item.product_id,

                        variant_id:
                            item.variant_id,

                        product_name:
                            item.product_name,

                        color:
                            item.color,

                        size:
                            item.size,

                        image:
                            item.image,

                        price:
                            Number(item.price),

                        quantity:
                            Number(item.quantity),

                        available_stock:
                            Number(item.available_stock),

                        subtotal:
                            itemSubtotal.toFixed(2)
                    };
                });


            return res.json({

                success: true,

                cart: {

                    items:
                        cartItems,

                    item_count:
                        cartItems.length,

                    total_quantity:
                        cartItems.reduce(
                            (total, item) =>
                                total +
                                Number(item.quantity),
                            0
                        ),

                    subtotal:
                        subtotal.toFixed(2),

                    total:
                        subtotal.toFixed(2)
                }
            });


        } catch (error) {

            console.error(
                "Get cart error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to fetch cart",
                error: error.message
            });
        }
    },


    // =====================================================
    // UPDATE CART QUANTITY
    // =====================================================

    async updateQuantity(req, res) {

        try {

            const customerId =
                req.customer.id;

            const cartItemId =
                Number(req.params.itemId);

            const quantity =
                Number(req.body.quantity);


            // =================================================
            // VALIDATION
            // =================================================

            if (
                !Number.isInteger(cartItemId) ||
                cartItemId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid cart item ID"
                });
            }


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Quantity must be a positive integer"
                });
            }


            // =================================================
            // FIND CART ITEM
            // =================================================

            const cartItem =
                await CartModel.findCartItemById(
                    customerId,
                    cartItemId
                );


            if (!cartItem) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Cart item not found"
                });
            }


            // =================================================
            // FIND CURRENT VARIANT STOCK
            // =================================================

            const product =
                await CartModel.findProductVariant(
                    cartItem.product_id,
                    cartItem.variant_id
                );


            if (!product) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product variant not found"
                });
            }


            if (
                product.product_status !== "ACTIVE"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "This product is no longer available"
                });
            }


            if (
                product.category_status !== "ACTIVE"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "This product category is no longer available"
                });
            }


            // =================================================
            // CHECK VARIANT STOCK
            // =================================================

            if (
                product.variant_stock <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Selected ${product.color} / ${product.size} variant is out of stock`
                });
            }


            if (
                quantity >
                product.variant_stock
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `Only ${product.variant_stock} item(s) available for ${product.color} / ${product.size}`
                });
            }


            // =================================================
            // UPDATE
            // =================================================

            await CartModel.updateCartItemQuantity(
                cartItem.id,
                quantity
            );


            return res.json({

                success: true,

                message:
                    "Cart quantity updated successfully",

                cart_item: {
                    id: cartItem.id,
                    product_id: cartItem.product_id,
                    variant_id: cartItem.variant_id,
                    color: product.color,
                    size: product.size,
                    quantity
                }
            });


        } catch (error) {

            console.error(
                "Update cart quantity error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update cart quantity",
                error: error.message
            });
        }
    },


    // =====================================================
    // REMOVE CART ITEM
    // =====================================================

    async removeItem(req, res) {

        try {

            const customerId =
                req.customer.id;

            const cartItemId =
                Number(req.params.itemId);


            if (
                !Number.isInteger(cartItemId) ||
                cartItemId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid cart item ID"
                });
            }


            const affectedRows =
                await CartModel.deleteCartItem(
                    customerId,
                    cartItemId
                );


            if (affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Cart item not found"
                });
            }


            return res.json({
                success: true,
                message:
                    "Product variant removed from cart"
            });


        } catch (error) {

            console.error(
                "Remove cart item error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to remove cart item",
                error: error.message
            });
        }
    }

};


module.exports = CartController;