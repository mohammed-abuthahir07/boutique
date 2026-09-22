const db = require("../../config/database");
const OrderModel = require("../models/orderModel");

const OrderController = {

    // ==================================================
    // CREATE ORDER FROM CUSTOMER CART
    // ==================================================

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


            // --------------------------------------------------
            // VALIDATE CHECKOUT INFORMATION
            // --------------------------------------------------

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


            const cleanName = String(name).trim();
            const cleanEmail = String(email).trim().toLowerCase();
            const cleanPhone = String(phone).trim();
            const cleanAddress = String(shipping_address).trim();


            if (cleanName.length < 2) {

                return res.status(400).json({
                    success: false,
                    message: "Name must be at least 2 characters"
                });
            }


            // FIXED EMAIL REGEX
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


            // --------------------------------------------------
            // START TRANSACTION
            // --------------------------------------------------

            await connection.beginTransaction();


            // --------------------------------------------------
            // GET ALL CUSTOMER CART ITEMS
            // --------------------------------------------------

            const cartItems =
                await OrderModel.getCartItemsForOrder(
                    customerId,
                    connection
                );


            // Cart must contain at least one item
            if (!cartItems.length) {

                await connection.rollback();

                return res.status(400).json({
                    success: false,
                    message: "Your cart is empty"
                });
            }


            // --------------------------------------------------
            // VALIDATE ALL CART ITEMS
            // CALCULATE TOTAL FROM DATABASE
            // --------------------------------------------------

            let totalAmount = 0;

            const orderItems = [];


            for (const item of cartItems) {

                // ----------------------------------------------
                // PRODUCT STATUS
                // ----------------------------------------------

                if (item.product_status !== "ACTIVE") {

                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            `${item.product_name} is no longer available`
                    });
                }


                // ----------------------------------------------
                // CATEGORY STATUS
                // ----------------------------------------------

                if (item.category_status !== "ACTIVE") {

                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            `${item.product_name} category is no longer available`
                    });
                }


                // ----------------------------------------------
                // VARIANT STOCK
                // ----------------------------------------------

                if (Number(item.variant_stock) <= 0) {

                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            `${item.product_name} (${item.color} / ${item.size}) is out of stock`
                    });
                }


                // ----------------------------------------------
                // REQUESTED QUANTITY VS STOCK
                // ----------------------------------------------

                if (
                    Number(item.quantity) >
                    Number(item.variant_stock)
                ) {

                    await connection.rollback();

                    return res.status(400).json({
                        success: false,
                        message:
                            `Only ${item.variant_stock} ${item.product_name} (${item.color} / ${item.size}) available`
                    });
                }


                // ----------------------------------------------
                // CALCULATE PRICE FROM DATABASE
                // ----------------------------------------------

                const price = Number(item.price);
                const quantity = Number(item.quantity);

                const subtotal =
                    price * quantity;

                totalAmount += subtotal;


                // ----------------------------------------------
                // PREPARE ORDER ITEM
                // ----------------------------------------------

                orderItems.push({

                    productId: item.product_id,

                    variantId: item.variant_id,

                    variantColor: item.color,

                    variantSize: item.size,

                    productName: item.product_name,

                    price,

                    quantity,

                    subtotal
                });
            }


            // --------------------------------------------------
            // GENERATE ORDER NUMBER
            // --------------------------------------------------

            const timestamp = Date.now();

            const orderId =
                `ORD-${timestamp}`;


            // --------------------------------------------------
            // CREATE ORDER
            // --------------------------------------------------

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


            // --------------------------------------------------
            // CREATE EVERY ORDER ITEM
            // AND REDUCE EXACT VARIANT STOCK
            // --------------------------------------------------

            for (const item of orderItems) {

                // Create order item
                await OrderModel.createOrderItem(
                    connection,
                    {
                        orderId: databaseOrderId,

                        productId: item.productId,

                        variantId: item.variantId,

                        variantColor: item.variantColor,

                        variantSize: item.variantSize,

                        productName: item.productName,

                        price: item.price,

                        quantity: item.quantity,

                        subtotal:
                            item.subtotal.toFixed(2)
                    }
                );


                // Reduce exact variant stock
                const affectedRows =
                    await OrderModel.reduceVariantStock(
                        connection,
                        item.variantId,
                        item.quantity
                    );


                if (affectedRows === 0) {

                    throw new Error(
                        `Stock update failed for ${item.productName} (${item.variantColor} / ${item.variantSize})`
                    );
                }
            }


            // --------------------------------------------------
            // CLEAR ALL CUSTOMER CART ITEMS
            // --------------------------------------------------

            await OrderModel.clearCart(
                customerId,
                connection
            );


            // --------------------------------------------------
            // COMMIT EVERYTHING
            // --------------------------------------------------

            await connection.commit();


            // --------------------------------------------------
            // SUCCESS RESPONSE
            // --------------------------------------------------

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

                        product_id:
                            item.productId,

                        variant_id:
                            item.variantId,

                        color:
                            item.variantColor,

                        size:
                            item.variantSize,

                        product_name:
                            item.productName,

                        price:
                            item.price,

                        quantity:
                            item.quantity,

                        subtotal:
                            item.subtotal.toFixed(2)
                    })),

                    total_amount:
                        totalAmount.toFixed(2),

                    order_status:
                        "PENDING"
                }
            });


        } catch (error) {

            // --------------------------------------------------
            // ROLLBACK EVERYTHING
            // --------------------------------------------------

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


    // ==================================================
    // GET MY ORDERS
    // ==================================================

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

                count:
                    orders.length,

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


    // ==================================================
    // GET ONE MY ORDER
    // ==================================================

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