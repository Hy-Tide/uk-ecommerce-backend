const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: false // Optional initially, set after successful payment
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stripePaymentIntentId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'GBP'
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Paid', 'Failed', 'Refund_Pending', 'Refunded', 'Refund_Failed'],
        default: 'Pending'
    },
    failureReason: {
        type: String
    },
    refundAmount: {
        type: Number
    },
    refundId: {
        type: String
    },
    refundDate: {
        type: Date
    },
    refundReason: {
        type: String
    },
    refundStatus: {
        type: String
    },
    checkoutData: {
        type: mongoose.Schema.Types.Mixed,
        description: 'Snapshot of the cart and checkout details for webhook order creation'
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
