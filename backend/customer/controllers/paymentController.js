const crypto = require("crypto");
const Razorpay = require("razorpay");
const db = require("../../config/database");
const OrderModel = require("../models/orderModel");
const {
    validateCheckoutFields,
    prepareCartOrder,
    fulfillPaidOrder
} = require("../utils/checkoutCart");

function getRazorpayClient() {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error("Razorpay keys are not configured");
    }

    return {
        key_id,
        client: new Razorpay({ key_id, key_secret })
    };
}

function verifySignature(orderId, paymentId, signature) {
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    const expectedBuf = Buffer.from(expected, "utf8");
    const receivedBuf = Buffer.from(String(signature || ""), "utf8");

    if (expectedBuf.length !== receivedBuf.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

const PaymentController = {

    async createRazorpayOrder(req, res) {
        const connection = await db.getConnection();

        try {
            const customerId = req.customer.id;
            const checkout = validateCheckoutFields(req.body);

            if (typeof checkout === "string") {
                return res.status(400).json({
                    success: false,
                    message: checkout
                });
            }

            await connection.beginTransaction();

            const prepared = await prepareCartOrder(customerId, connection);

            if (prepared.error) {
                await connection.rollback();
                return res.status(prepared.status).json({
                    success: false,
                    message: prepared.error
                });
            }

            await connection.commit();

            const amountPaise = Math.round(prepared.totalAmount * 100);

            if (amountPaise < 100) {
                return res.status(400).json({
                    success: false,
                    message: "Order amount is too low for online payment"
                });
            }

            const { key_id, client } = getRazorpayClient();

            const razorpayOrder = await client.orders.create({
                amount: amountPaise,
                currency: "INR",
                receipt: `rcpt_${Date.now()}`.slice(0, 40),
                notes: {
                    customer_id: String(customerId)
                }
            });

            return res.status(200).json({
                success: true,
                key_id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                razorpay_order_id: razorpayOrder.id,
                customer: {
                    name: checkout.cleanName,
                    email: checkout.cleanEmail,
                    phone: checkout.cleanPhone
                }
            });
        } catch (error) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Razorpay create-order rollback error:", rollbackError);
            }

            console.error("Razorpay create-order error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to start online payment"
            });
        } finally {
            connection.release();
        }
    },

    async verifyRazorpayPayment(req, res) {
        const connection = await db.getConnection();

        try {
            const customerId = req.customer.id;

            const {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            } = req.body;

            const checkout = validateCheckoutFields(req.body);

            if (typeof checkout === "string") {
                return res.status(400).json({
                    success: false,
                    message: checkout
                });
            }

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: "Payment details are incomplete"
                });
            }

            if (!verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
                return res.status(400).json({
                    success: false,
                    message: "Payment verification failed"
                });
            }

            const existing = await OrderModel.findByRazorpayPaymentId(
                razorpay_payment_id,
                customerId
            );

            if (existing) {
                return res.status(200).json({
                    success: true,
                    message: "Order already placed",
                    order: existing
                });
            }

            await connection.beginTransaction();

            const prepared = await prepareCartOrder(customerId, connection);

            if (prepared.error) {
                await connection.rollback();
                return res.status(prepared.status).json({
                    success: false,
                    message: prepared.error
                });
            }

            const order = await fulfillPaidOrder(connection, {
                customerId,
                checkout,
                orderItems: prepared.orderItems,
                totalAmount: prepared.totalAmount,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            });

            await connection.commit();

            return res.status(201).json({
                success: true,
                message: "Payment verified and order placed successfully",
                order
            });
        } catch (error) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Razorpay verify rollback error:", rollbackError);
            }

            if (error && error.code === "ER_DUP_ENTRY") {
                const existing = await OrderModel.findByRazorpayPaymentId(
                    req.body.razorpay_payment_id,
                    req.customer.id
                );

                if (existing) {
                    return res.status(200).json({
                        success: true,
                        message: "Order already placed",
                        order: existing
                    });
                }
            }

            console.error("Razorpay verify error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to complete payment"
            });
        } finally {
            connection.release();
        }
    }
};

module.exports = PaymentController;
