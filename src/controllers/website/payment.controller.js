const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../../models/payment.model');
const Order = require('../../models/order.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');


exports.createPaymentIntent = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        
        if (!orderId) {
            return next(new ApiError(400, 'Order ID is required'));
        }

        const order = await Order.findOne({ _id: orderId, user: req.user._id });
        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        if (order.paymentStatus === 'completed') {
            return next(new ApiError(400, 'Order is already paid'));
        }

        // Check if a payment already exists for this order
        let payment = await Payment.findOne({ orderId: order._id, status: { $in: ['Pending', 'Processing'] } });

        let paymentIntent;

        if (payment) {
            // Retrieve existing payment intent
            paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
            
            // If the amount changed (which shouldn't happen usually for placed orders, but just in case)
            if (paymentIntent.amount !== Math.round(order.totalAmount * 100)) {
                paymentIntent = await stripe.paymentIntents.update(payment.stripePaymentIntentId, {
                    amount: Math.round(order.totalAmount * 100)
                });
                payment.amount = order.totalAmount;
                await payment.save();
            }
        } else {
            // Create a new PaymentIntent
            paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(order.totalAmount * 100), // Stripe expects amounts in pence/cents
                currency: 'gbp',
                metadata: {
                    orderId: order._id.toString(),
                    userId: req.user._id.toString()
                }
            });

            // Create Payment record
            payment = await Payment.create({
                orderId: order._id,
                userId: req.user._id,
                stripePaymentIntentId: paymentIntent.id,
                amount: order.totalAmount,
                status: 'Pending'
            });
        }

        res.status(200).json(new ApiResponse(200, {
            clientSecret: paymentIntent.client_secret,
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
        }, 'Payment intent created successfully'));
    } catch (error) {
        next(error);
    }
};

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
        
        // Find the payment in DB
        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntent.id });
        
        if (!payment) {
            console.error('Payment record not found for Intent:', paymentIntent.id);
            return res.json({ received: true });
        }

        switch (event.type) {
            case 'payment_intent.succeeded':
                payment.status = 'Paid';
                await payment.save();

                await Order.findByIdAndUpdate(payment.orderId, {
                    paymentStatus: 'completed'
                });
                break;
                
            case 'payment_intent.payment_failed':
                payment.status = 'Failed';
                payment.failureReason = paymentIntent.last_payment_error?.message || 'Payment failed';
                await payment.save();

                await Order.findByIdAndUpdate(payment.orderId, {
                    paymentStatus: 'failed'
                });
                break;
                
            case 'payment_intent.processing':
                payment.status = 'Processing';
                await payment.save();
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
