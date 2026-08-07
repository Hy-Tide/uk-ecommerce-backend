const mongoose = require('mongoose');

const offerProductSchema = new mongoose.Schema({
    offerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }
}, { timestamps: true });

// Prevent duplicate mappings
offerProductSchema.index({ offerId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('OfferProduct', offerProductSchema);
