const OrderModel = require("../models/orderModel");

function validateCheckoutFields({ name, email, phone, shipping_address }) {
    if (!name || !email || !phone || !shipping_address) {
        return "Name, email, phone and shipping address are required";
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();
    const cleanAddress = String(shipping_address).trim();

    if (cleanName.length < 2) {
        return "Name must be at least 2 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        return "Please enter a valid email address";
    }

    if (!cleanPhone) {
        return "Phone number is required";
    }

    if (cleanAddress.length < 5) {
        return "Shipping address must be at least 5 characters";
    }

    return {
        cleanName,
        cleanEmail,
        cleanPhone,
        cleanAddress
    };
}

async function prepareCartOrder(customerId, connection) {
    const cartItems = await OrderModel.getCartItemsForOrder(
        customerId,
        connection
    );

    if (!cartItems.length) {
        return { error: "Your cart is empty", status: 400 };
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
        if (item.product_status !== "ACTIVE") {
            return {
                error: `${item.product_name} is no longer available`,
                status: 400
            };
        }

        if (item.category_status !== "ACTIVE") {
            return {
                error: `${item.product_name} category is no longer available`,
                status: 400
            };
        }

        if (Number(item.variant_stock) <= 0) {
            return {
                error: `${item.product_name} (${item.color} / ${item.size}) is out of stock`,
                status: 400
            };
        }

        if (Number(item.quantity) > Number(item.variant_stock)) {
            return {
                error: `Only ${item.variant_stock} ${item.product_name} (${item.color} / ${item.size}) available`,
                status: 400
            };
        }

        const price = Number(item.price);
        const quantity = Number(item.quantity);
        const subtotal = price * quantity;
        totalAmount += subtotal;

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

    return { totalAmount, orderItems };
}

async function fulfillPaidOrder(connection, {
    customerId,
    checkout,
    orderItems,
    totalAmount,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
}) {
    const orderId = `ORD-${Date.now()}`;

    const databaseOrderId = await OrderModel.createPaidOrder(connection, {
        customerId,
        orderId,
        customerName: checkout.cleanName,
        customerEmail: checkout.cleanEmail,
        customerPhone: checkout.cleanPhone,
        shippingAddress: checkout.cleanAddress,
        totalAmount: totalAmount.toFixed(2),
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
    });

    for (const item of orderItems) {
        await OrderModel.createOrderItem(connection, {
            orderId: databaseOrderId,
            productId: item.productId,
            variantId: item.variantId,
            variantColor: item.variantColor,
            variantSize: item.variantSize,
            productName: item.productName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal.toFixed(2)
        });

        const affectedRows = await OrderModel.reduceVariantStock(
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

    await OrderModel.clearCart(customerId, connection);

    return {
        id: databaseOrderId,
        order_id: orderId,
        customer: {
            name: checkout.cleanName,
            email: checkout.cleanEmail,
            phone: checkout.cleanPhone
        },
        shipping_address: checkout.cleanAddress,
        items: orderItems.map((item) => ({
            product_id: item.productId,
            variant_id: item.variantId,
            color: item.variantColor,
            size: item.variantSize,
            product_name: item.productName,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.subtotal.toFixed(2)
        })),
        total_amount: totalAmount.toFixed(2),
        order_status: "PENDING",
        payment_method: "RAZORPAY",
        payment_status: "PAID"
    };
}

module.exports = {
    validateCheckoutFields,
    prepareCartOrder,
    fulfillPaidOrder
};
