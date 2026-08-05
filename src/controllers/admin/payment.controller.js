const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../../models/payment.model');
const Order = require('../../models/order.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const mongoose = require('mongoose');

exports.getAllPayments = async (req, res, next) => {
    try {
        const { search, status, startDate, endDate, page = 1, limit = 10 } = req.query;

        const query = {};

        if (status) {
            query.status = status;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        let orderIds = [];
        let userIds = [];

        // If there's a search term, we need to find matching Orders (by orderNumber) or Users (by name/email)
        if (search) {
            const regex = new RegExp(search, 'i');
            
            // Search Orders
            const orders = await Order.find({ orderNumber: regex }).select('_id');
            orderIds = orders.map(o => o._id);
            
            // Search Users
            const User = require('../../models/user.model');
            const users = await User.find({ $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] }).select('_id');
            userIds = users.map(u => u._id);
            
            query.$or = [
                { orderId: { $in: orderIds } },
                { userId: { $in: userIds } }
            ];
            
            if (mongoose.Types.ObjectId.isValid(search)) {
                query.$or.push({ _id: search });
            }
        }

        const skip = (page - 1) * limit;

        const payments = await Payment.find(query)
            .populate('orderId', 'orderNumber totalAmount')
            .populate('userId', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            payments,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        }, 'Payments retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getFailedPayments = async (req, res, next) => {
    try {
        req.query.status = 'Failed';
        return this.getAllPayments(req, res, next);
    } catch (error) {
        next(error);
    }
};

exports.getPaymentDetails = async (req, res, next) => {
    try {
        const { id } = req.params;

        const payment = await Payment.findById(id)
            .populate('orderId', 'orderNumber totalAmount orderStatus')
            .populate('userId', 'firstName lastName email phone');

        if (!payment) {
            return next(new ApiError(404, 'Payment not found'));
        }

        res.status(200).json(new ApiResponse(200, { payment }, 'Payment details retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.refundPayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount } = req.body; // Amount in standard currency (e.g., 10.50)

        const payment = await Payment.findById(id);

        if (!payment) {
            return next(new ApiError(404, 'Payment not found'));
        }

        if (payment.status !== 'Paid') {
            return next(new ApiError(400, `Cannot refund payment with status: ${payment.status}`));
        }

        const refundPayload = {
            payment_intent: payment.stripePaymentIntentId,
        };

        if (amount) {
            refundPayload.amount = Math.round(amount * 100);
        }

        const refund = await stripe.refunds.create(refundPayload);

        payment.status = 'Refunded';
        payment.refundAmount = amount || payment.amount;
        payment.refundId = refund.id;
        payment.refundDate = new Date();
        await payment.save();

        // Update the Order's paymentStatus
        await Order.findByIdAndUpdate(payment.orderId, {
            paymentStatus: 'refunded'
        });

        res.status(200).json(new ApiResponse(200, { payment }, 'Payment refunded successfully'));
    } catch (error) {
        console.error('Stripe Refund Error:', error);
        next(new ApiError(500, error.message || 'Error processing refund'));
    }
};
