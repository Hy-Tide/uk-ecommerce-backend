const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../../models/payment.model');
const Order = require('../../models/order.model');
const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');
const Coupon = require('../../models/coupon.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const { logStockChange } = require('../../utils/stockLogger');

// Create Payment Intent from Cart
exports.createPaymentIntent = async (req, res, next) => {
    try {
        const { shippingAddress, billingAddress, deliveryNotes, deliverySlot } = req.body;

        if (!shippingAddress) {
            return next(new ApiError(400, 'Shipping address is required before payment'));
        }

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return next(new ApiError(400, 'Cart is empty'));
        }

        if (cart.totalAmount <= 0) {
            return next(new ApiError(400, 'Cart total is zero'));
        }

        // Validate stock before intent creation
        for (const item of cart.items) {
            const product = item.product;
            if (!product) return next(new ApiError(404, 'A product in your cart was not found'));

            const variation = product.variations.id(item.variationId);
            if (!variation || variation.stockQuantity < item.quantity) {
                return next(new ApiError(400, `Not enough stock for ${product.name}`));
            }
        }

        // Snapshot cart for webhook
        const itemsSnapshot = cart.items.map(item => ({
            product: item.product._id,
            variationId: item.variationId,
            name: item.product.name,
            price: item.price,
            quantity: item.quantity
        }));

        const checkoutData = {
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            deliveryNotes,
            deliverySlot,
            couponId: cart.coupon,
            subTotal: cart.subTotal,
            discountAmount: cart.discountAmount,
            totalAmount: cart.totalAmount,
            itemsSnapshot
        };

        // Create a new PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(cart.totalAmount * 100), // Stripe expects amounts in pence/cents
            currency: 'gbp',
            metadata: {
                userId: req.user._id.toString()
            }
        });

        // Create Payment record WITHOUT orderId
        await Payment.create({
            userId: req.user._id,
            stripePaymentIntentId: paymentIntent.id,
            amount: cart.totalAmount,
            status: 'Pending',
            checkoutData
        });

        res.status(200).json(new ApiResponse(200, {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        }, 'Payment intent created successfully'));
    } catch (error) {
        next(error);
    }
};

// Internal Helper for Webhook and Verification
const processSuccessfulPayment = async (paymentIntentId) => {
    // 1. Fetch Payment Intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment intent is not succeeded in Stripe');
    }

    // 2. Fetch Pending Payment from DB
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
        throw new Error('Payment record not found');
    }

    // 3. Idempotency Check
    if (payment.orderId) {
        // Order already created
        return { orderId: payment.orderId, alreadyCreated: true };
    }

    // 4. Verify Amount
    if (paymentIntent.amount !== Math.round(payment.amount * 100)) {
        throw new Error('Payment amount mismatch between DB and Stripe');
    }

    const {
        shippingAddress,
        billingAddress,
        deliveryNotes,
        deliverySlot,
        couponId,
        subTotal,
        discountAmount,
        totalAmount,
        itemsSnapshot
    } = payment.checkoutData;

    // 5. Re-validate Stock & Prepare Order Items
    const orderItems = [];
    for (const item of itemsSnapshot) {
        const product = await Product.findById(item.product);
        if (!product) {
            await issueRefund(paymentIntentId, payment, 'Product not found during order creation');
            throw new Error(`Product ${item.product} not found`);
        }

        const variation = product.variations.id(item.variationId);
        if (!variation || variation.stockQuantity < item.quantity) {
            await issueRefund(paymentIntentId, payment, 'Out of stock after payment');
            throw new Error(`Not enough stock for ${product.name}`);
        }

        // Deduct Stock
        const previousStock = variation.stockQuantity;
        variation.stockQuantity -= item.quantity;
        await product.save();

        await logStockChange({
            productId: product._id,
            variationId: variation._id,
            action: 'STOCK_REMOVED',
            quantityChanged: item.quantity,
            previousStock,
            newStock: variation.stockQuantity,
            reason: 'Checkout Order (Stripe Paid)',
            user: payment.userId,
            userModel: 'User'
        });

        orderItems.push(item);
    }

    if (couponId) {
        const coupon = await Coupon.findById(couponId);
        if (coupon) {
            coupon.usedCount += 1;
            await coupon.save();
        }
    }

    // 6. Create Order
    const orderNumber = 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    const order = await Order.create({
        orderNumber,
        user: payment.userId,
        items: orderItems,
        shippingAddress,
        billingAddress,
        deliveryNotes,
        deliverySlot,
        coupon: couponId,
        subTotal,
        discountAmount,
        shippingFee: 0, // Placeholder
        totalAmount,
        paymentMethod: 'stripe',
        paymentStatus: 'completed',
        orderStatus: 'Confirmed'
    });

    // 7. Update Payment Record
    payment.orderId = order._id;
    payment.status = 'Paid';
    await payment.save();

    // 8. Clear Cart
    await Cart.findOneAndUpdate({ user: payment.userId }, {
        $set: { items: [], coupon: null, subTotal: 0, discountAmount: 0, totalAmount: 0 }
    });

    return { orderId: order._id, alreadyCreated: false };
};

const issueRefund = async (paymentIntentId, payment, reason) => {
    try {
        const refund = await stripe.refunds.create({ payment_intent: paymentIntentId, reason: 'requested_by_customer' });
        payment.status = 'Refunded';
        payment.failureReason = reason;
        payment.refundAmount = payment.amount;
        payment.refundId = refund.id;
        payment.refundDate = new Date();
        await payment.save();
        console.error(`Refund issued for PaymentIntent ${paymentIntentId} due to: ${reason}`);
    } catch (refundError) {
        console.error(`CRITICAL: Failed to issue refund for PaymentIntent ${paymentIntentId}`, refundError);
    }
};

// Webhook Handler
exports.webhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        // req.body must be the raw buffer here
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        const paymentIntent = event.data.object;

        switch (event.type) {
            case 'payment_intent.succeeded':
                console.log(`Webhook: Processing succeeded payment for ${paymentIntent.id}`);
                await processSuccessfulPayment(paymentIntent.id);
                break;

            case 'payment_intent.payment_failed':
                const failedPayment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
                if (failedPayment) {
                    failedPayment.status = 'Failed';
                    failedPayment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
                    await failedPayment.save();
                }
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Frontend Verification Endpoint
exports.verifyPaymentAndOrder = async (req, res, next) => {
    try {
        const { paymentIntentId } = req.body;
        if (!paymentIntentId) {
            return next(new ApiError(400, 'Payment Intent ID is required'));
        }

        const result = await processSuccessfulPayment(paymentIntentId);

        res.status(200).json(new ApiResponse(200, { orderId: result.orderId }, result.alreadyCreated ? 'Order already confirmed' : 'Order placed successfully'));
    } catch (error) {
        console.error('Verification Error:', error.message);
        next(new ApiError(400, `Payment verification failed: ${error.message}`));
    }
};

exports.getPaymentStatus = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        const payment = await Payment.findOne({ orderId, userId: req.user._id }).sort({ createdAt: -1 });

        if (!payment) {
            return next(new ApiError(404, 'Payment not found for this order'));
        }

        res.status(200).json(new ApiResponse(200, { payment }, 'Payment status retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
