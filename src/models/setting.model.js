const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    storeName: { type: String, default: 'UK E-Commerce' },
    address: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    supportEmail: { type: String, default: '' },
    phone: { type: String, default: '' },
    whatsappNumber: { type: String, default: '' },
    socialMedia: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' }
    },
    currency: { type: String, default: 'GBP' },
    taxPercentage: { type: Number, default: 20 },
    deliveryCharge: { type: Number, default: 5 },
    minimumOrderAmount: { type: Number, default: 10 },
    freeDeliveryAmount: { type: Number, default: 50 },
    stripeKeys: {
        publicKey: { type: String, default: '' },
        secretKey: { type: String, default: '' }
    },
    paypalKeys: {
        clientId: { type: String, default: '' },
        secret: { type: String, default: '' }
    },
    googlePayMerchantId: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    faviconUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
