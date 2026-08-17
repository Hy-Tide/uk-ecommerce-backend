const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Partner name is required'], trim: true },
    phone: { type: String, required: [true, 'Phone number is required'], trim: true },
    email: { type: String, trim: true, lowercase: true },
    profileImage: { type: String },
    vehicleType: { type: String, trim: true },
    vehicleNumber: { type: String, trim: true },
    status: {
        type: String,
        enum: ['AVAILABLE', 'ON_DELIVERY', 'INACTIVE'],
        default: 'AVAILABLE'
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
