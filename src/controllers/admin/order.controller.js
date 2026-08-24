const Order = require('../../models/order.model');
const Payment = require('../../models/payment.model');
const AuditLog = require('../../models/audit_log.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAllOrders = async (req, res, next) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.orderNumber = { $regex: search, $options: 'i' };
        }
        if (status) {
            query.orderStatus = status;
        }

        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            orders,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Orders retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getOrderDetails = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name slug sku images')
            .populate('coupon', 'code discountType discountValue')
            .populate('deliveryPersonId', 'name email');

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        res.status(200).json(new ApiResponse(200, { order }, 'Order details retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus } = req.body;
        const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready For Delivery', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(orderStatus)) {
            return next(new ApiError(400, 'Invalid order status'));
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        order.orderStatus = orderStatus;
        if (orderStatus === 'Delivered') {
            order.paymentStatus = 'completed'; // Assuming delivery means paid for COD
        }

        await order.save();

        res.status(200).json(new ApiResponse(200, { order }, 'Order status updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.assignDeliveryPerson = async (req, res, next) => {
    try {
        const { deliveryPersonId } = req.body;

        if (!deliveryPersonId) {
            return next(new ApiError(400, 'Delivery Person ID is required'));
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        order.deliveryPersonId = deliveryPersonId;
        await order.save();

        res.status(200).json(new ApiResponse(200, { order }, 'Delivery person assigned successfully'));
    } catch (error) {
        next(error);
    }
};

exports.printInvoice = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name slug sku images');

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        res.status(200).json(new ApiResponse(200, {
            invoice: {
                orderNumber: order.orderNumber,
                date: order.createdAt,
                status: order.orderStatus,
                customer: order.user,
                shippingAddress: order.shippingAddress,
                billingAddress: order.billingAddress,
                items: order.items,
                subTotal: order.subTotal,
                discount: order.discountAmount,
                shippingFee: order.shippingFee,
                total: order.totalAmount
            }
        }, 'Invoice retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        order.orderStatus = 'Cancelled';
        order.cancellationReason = req.body.reason || 'Admin requested cancellation';
        order.cancellationDescription = req.body.description || '';
        order.cancelledBy = req.user._id;
        order.cancelledByType = 'ADMIN';
        order.cancelledAt = new Date();
        await order.save();

        await AuditLog.create({
            adminId: req.user._id,
            action: 'ORDER_CANCELLED',
            entityId: order._id,
            entityType: 'Order',
            details: { reason: req.body.reason },
            ipAddress: req.ip
        });

        // Cancel Stripe payment if it exists
        if (order.paymentMethod === 'stripe') {
            const payment = await Payment.findOne({ orderId: order._id, status: 'Paid' });
            if (payment && payment.stripePaymentIntentId) {
                if (!['Refund_Pending', 'Refunded'].includes(payment.status)) {
                    try {
                        const refund = await stripe.refunds.create({
                            payment_intent: payment.stripePaymentIntentId,
                            reason: 'requested_by_customer'
                        }, {
                            idempotencyKey: `admin_cancel_refund_${order._id.toString()}`
                        });

                        payment.status = 'Refund_Pending';
                        payment.refundId = refund.id;
                        payment.refundAmount = payment.amount;
                        payment.refundReason = req.body.reason || 'Admin requested cancellation';
                        payment.refundStatus = refund.status;
                        await payment.save();
                    } catch (stripeError) {
                        console.error('Stripe refund failed during admin cancellation:', stripeError);
                        payment.status = 'Refund_Failed';
                        payment.failureReason = stripeError.message;
                        await payment.save();

                        await AuditLog.create({
                            adminId: req.user._id,
                            action: 'REFUND_FAILED',
                            entityId: order._id,
                            entityType: 'Order',
                            details: { error: stripeError.message },
                            ipAddress: req.ip
                        });
                    }
                }
            }
        }

        res.status(200).json(new ApiResponse(200, { order }, 'Order cancelled successfully'));
    } catch (error) {
        next(error);
    }
};

exports.refundOrder = async (req, res, next) => {
    try {
        const { amount, reason } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        if (order.paymentMethod !== 'stripe') {
            return next(new ApiError(400, 'Only stripe payments can be refunded automatically'));
        }

        const payment = await Payment.findOne({ orderId: order._id, status: { $in: ['Paid'] } });
        if (!payment) {
            return next(new ApiError(404, 'Eligible payment not found for this order'));
        }

        const refundAmount = amount ? amount : payment.amount;

        // We might want to check the remaining refundable amount instead of total amount if it's already partially refunded
        // Assuming Stripe handles the limit check, or we could track remaining amount. For simplicity, let Stripe API validate it.
        // Or if we want to be safe:
        if (refundAmount > payment.amount) {
            return next(new ApiError(400, 'Refund amount cannot exceed payment amount'));
        }

        const idempotencyKey = `admin_refund_${order._id.toString()}_${Date.now()}`;

        const refund = await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId,
            amount: Math.round(refundAmount * 100),
            reason: 'requested_by_customer'
        }, {
            idempotencyKey
        });

        payment.status = 'Refund_Pending';
        payment.refundId = refund.id;
        payment.refundReason = reason || 'Admin requested refund';
        payment.refundStatus = refund.status;
        await payment.save();

        const actionType = 'ORDER_REFUNDED';

        await AuditLog.create({
            adminId: req.user._id,
            action: actionType,
            entityId: order._id,
            entityType: 'Order',
            details: { amount: refundAmount, reason },
            ipAddress: req.ip
        });

        res.status(200).json(new ApiResponse(200, { payment }, 'Refund initiated successfully'));
    } catch (error) {
        // If Stripe throws an error (e.g. charge has already been refunded), we can catch it
        if (error.type === 'StripeInvalidRequestError') {
            await AuditLog.create({
                adminId: req.user._id,
                action: 'REFUND_FAILED',
                entityId: req.params.id,
                entityType: 'Order',
                details: { error: error.message },
                ipAddress: req.ip
            });
            return next(new ApiError(400, error.message));
        }
        next(error);
    }
};
