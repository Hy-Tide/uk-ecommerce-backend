const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Notification message is required']
    },
    type: {
        type: String,
        enum: ['Promotional', 'Order', 'Offer', 'System', 'General'],
        default: 'General'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() { return !this.isBroadcast; }
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isBroadcast: {
        type: Boolean,
        default: false
    },
    recipients: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['sent', 'failed'], default: 'sent' },
        isRead: { type: Boolean, default: false }
    }],
    deliveryStats: {
        total: { type: Number, default: 0 },
        sent: { type: Number, default: 0 },
        failed: { type: Number, default: 0 }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

