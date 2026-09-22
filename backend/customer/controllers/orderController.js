const db = require("../../config/database");
const OrderModel = require("../models/orderModel");

const OrderController = {

    // CREATE ORDER FROM CART
    async createOrder(req, res) {

        const connection = await db.getConnection();

        try {

            const customerId = req.customer.id;

            const {
                name,
                email,
                phone,
                shipping_address
            } = req.body;


            // -----------------------------
            // Validate checkout information
            // -----------------------------

            if (
                !name ||
                !email ||
                !phone ||
                !shipping_address
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Name, email, phone and shipping address are required"
                });
            }


            const cleanName = name.trim();
            const cleanEmail = email.trim().toLowerCase();
            const cleanPhone = phone.trim();
            const cleanAddress = shipping_address.trim();


            if (cleanName.length < 2) {

                return res.status(400).json({
                    success: false,
                    message: "Name must be at least 2 characters"
                });

            }


            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(cleanEmail)) {

                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address"
                });

            }


            if (!cleanPhone) {

                return res.status(400).json({
                    success: false,
                    message: "Phone number is required"
                });

            }


            if (cleanAddress.length < 5) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Shipping address must be at least 5 characters"
                });

            }


            // -----------------------------
            // Start transaction
            // -----------------------------

            await connection.beginTransaction();


            // -----------------------------
            // Get customer's cart
            // -----------------------------

            const cartItems =
                await OrderModel.getCartItemsForOrder(
                    customerId,
                    connection
                );


            if (!cartItems.length) {

                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Your cart is empty"
                });

            }


            // -----------------------------
            // Validate stock and calculate total
            // -----------------------------

            let totalAmount = 0;

            const orderItems = [];


            for (const item of cartItems) {

                if (item.product_status !== "ACTIVE") {

                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            `${item.product_name} is no longer available`
                    });

                }


                if (item.category_status !== "ACTIVE") {

                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            `${item.product_name} category is no longer available`
                    });

                }


                if (item.variant_stock <= 0) {

                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            `${item.product_name} (${item.color}) is out of stock`
                    });

                }


                if (item.quantity > item.variant_stock) {

                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            `Only ${item.variant_stock} ${item.product_name} (${item.color}) available`
                    });

                }


                const price = Number(item.price);
                const quantity = Number(item.quantity);

                const subtotal =
                    price * quantity;

                totalAmount += subtotal;


                orderItems.push({
                    productId: item.product_id,
                    variantId: item.variant_id,
                    variantColor: item.color,
                    productName: item.product_name,
                    price,
                    quantity,
                    subtotal
                });

            }


            // -----------------------------
            // Generate order number
            // -----------------------------

            const timestamp =
                Date.now();

            const orderId =
                `ORD-${timestamp}`;


            // -----------------------------
            // Create order
            // -----------------------------

            const databaseOrderId =
                await OrderModel.createOrder(
                    connection,
                    {
                        customerId,
                        orderId,
                        customerName: cleanName,
                        customerEmail: cleanEmail,
                        customerPhone: cleanPhone,
                        shippingAddress: cleanAddress,
                        totalAmount:
                            totalAmount.toFixed(2)
                    }
                );


            // -----------------------------
            // Create order items
            // + reduce variant stock
            // -----------------------------

            for (const item of orderItems) {

                await OrderModel.createOrderItem(
                    connection,
                    {
                        orderId: databaseOrderId,
                        productId: item.productId,
                        variantId: item.variantId,
                        variantColor: item.variantColor,
                        productName: item.productName,
                        price: item.price,
                        quantity: item.quantity,
                        subtotal:
                            item.subtotal.toFixed(2)
                    }
                );


                const affectedRows =
                    await OrderModel.reduceVariantStock(
                        connection,
                        item.variantId,
                        item.quantity
                    );


                if (affectedRows === 0) {

                    throw new Error(
                        `Stock update failed for ${item.productName} (${item.variantColor})`
                    );

                }

            }


            // -----------------------------
            // Clear customer's cart
            // -----------------------------

            await OrderModel.clearCart(
                customerId,
                connection
            );


            // -----------------------------
            // Commit transaction
            // -----------------------------

            await connection.commit();


            // -----------------------------
            // Response
            // -----------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Order placed successfully",

                order: {

                    id: databaseOrderId,

                    order_id: orderId,

                    customer: {
                        name: cleanName,
                        email: cleanEmail,
                        phone: cleanPhone
                    },

                    shipping_address:
                        cleanAddress,

                    items: orderItems.map(item => ({
                        product_id: item.productId,
                        variant_id: item.variantId,
                        color: item.variantColor,
                        product_name: item.productName,
                        price: item.price,
                        quantity: item.quantity,
                        subtotal:
                            item.subtotal.toFixed(2)
                    })),

                    total_amount:
                        totalAmount.toFixed(2),

                    order_status: "PENDING"

                }

            });


        } catch (error) {

            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(
                    "Rollback error:",
                    rollbackError
                );
            }


            console.error(
                "Create order error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to place order",

                error:
                    error.message

            });

        } finally {

            connection.release();

        }

    },


    // GET MY ORDERS
    async getMyOrders(req, res) {

        try {

            const customerId =
                req.customer.id;


            const orders =
                await OrderModel.findOrdersByCustomerId(
                    customerId
                );


            return res.json({

                success: true,

                count: orders.length,

                orders

            });


        } catch (error) {

            console.error(
                "Get customer orders error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch orders",

                error:
                    error.message

            });

        }

    },


    // GET ONE ORDER
    async getMyOrderById(req, res) {

        try {

            const customerId =
                req.customer.id;

            const orderId =
                req.params.id;


            if (!/^\d+$/.test(orderId)) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid order ID"

                });

            }


            const order =
                await OrderModel.findCustomerOrderById(
                    customerId,
                    orderId
                );


            if (!order) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Order not found"

                });

            }


            return res.json({

                success: true,

                order

            });


        } catch (error) {

            console.error(
                "Get customer order error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to fetch order",

                error:
                    error.message

            });

        }

    }

};


module.exports = OrderController;