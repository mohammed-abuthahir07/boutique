const CartModel = require("../models/cartModel");

const CartController = {

    async addToCart(req, res) {

        try {

            const customerId = req.customer.id;

            const productId = req.body.product_id;
            const variantId = req.body.variant_id;
            const quantity = Number(req.body.quantity);

            if (!productId || !variantId || !quantity) {
                return res.status(400).json({
                    success: false,
                    message:
                        "product_id, variant_id and quantity are required"
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

            const product =
                await CartModel.findProductVariant(
                    productId,
                    variantId
                );

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Product or selected color not found"
                });
            }

            if (product.product_status !== "ACTIVE") {
                return res.status(400).json({
                    success: false,
                    message:
                        "This product is not available"
                });
            }

            if (product.category_status !== "ACTIVE") {
                return res.status(400).json({
                    success: false,
                    message:
                        "This product category is not available"
                });
            }

            if (product.variant_stock <= 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Selected color is out of stock"
                });
            }

            if (quantity > product.variant_stock) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Only ${product.variant_stock} item(s) available`
                });
            }

            let cart =
                await CartModel.findCartByCustomerId(
                    customerId
                );

            if (!cart) {
                const cartId =
                    await CartModel.createCart(
                        customerId
                    );

                cart = {
                    id: cartId
                };
            }

            const existingItem =
                await CartModel.findCartItem(
                    cart.id,
                    productId,
                    variantId
                );

            if (existingItem) {

                const newQuantity =
                    existingItem.quantity + quantity;

                if (newQuantity > product.variant_stock) {
                    return res.status(400).json({
                        success: false,
                        message:
                            `Only ${product.variant_stock} item(s) available`
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
                    quantity: newQuantity
                });
            }

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
                    "Product added to cart successfully",
                cart_item: {
                    id: cartItemId,
                    product_id: Number(productId),
                    variant_id: Number(variantId),
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

    async getCart(req, res) {

        try {

            const customerId = req.customer.id;

            const items =
                await CartModel.getCartItems(
                    customerId
                );

            let subtotal = 0;

            const cartItems = items.map(item => {

                const itemSubtotal =
                    Number(item.price) *
                    Number(item.quantity);

                subtotal += itemSubtotal;

                return {
                    cart_item_id: item.cart_item_id,
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    product_name: item.product_name,
                    color: item.color,
                    image: item.image,
                    price: Number(item.price),
                    quantity: item.quantity,
                    available_stock: item.available_stock,
                    subtotal: itemSubtotal.toFixed(2)
                };
            });

            return res.json({
                success: true,
                cart: {
                    items: cartItems,
                    item_count: cartItems.length,
                    total_quantity: cartItems.reduce(
                        (total, item) =>
                            total + Number(item.quantity),
                        0
                    ),
                    subtotal: subtotal.toFixed(2),
                    total: subtotal.toFixed(2)
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

    async updateQuantity(req, res) {

        try {

            const customerId = req.customer.id;
            const cartItemId = req.params.itemId;
            const quantity = Number(req.body.quantity);

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

            if (quantity > product.variant_stock) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Only ${product.variant_stock} item(s) available`
                });
            }

            await CartModel.updateCartItemQuantity(
                cartItem.id,
                quantity
            );

            return res.json({
                success: true,
                message:
                    "Cart quantity updated successfully",
                quantity
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

    async removeItem(req, res) {

        try {

            const customerId = req.customer.id;
            const cartItemId = req.params.itemId;

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
                    "Product removed from cart"
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