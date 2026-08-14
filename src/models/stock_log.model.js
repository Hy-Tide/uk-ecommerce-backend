const mongoose = require('mongoose');

const stockLogSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variationId: {
        type: mongoose.Schema.Types.ObjectId
    },
    action: {
        type: String,
        enum: ['STOCK_ADDED', 'STOCK_REMOVED', 'STOCK_ADJUSTED'],
        required: true
    },
    quantityChanged: {
        type: Number,
        required: true
    },
    previousStock: {
        type: Number,
        required: true
    },
    newStock: {
        type: Number,
        required: true
    },
    reason: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'userModel'
    },
    userModel: {
        type: String,
        enum: ['AdminUser', 'User', 'System']
    }
}, { timestamps: true });

module.exports = mongoose.model('StockLog', stockLogSchema);
