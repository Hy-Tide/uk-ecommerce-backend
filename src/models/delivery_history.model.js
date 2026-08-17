const mongoose = require('mongoose');

const deliveryHistorySchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner' },
    
    action: { type: String, required: true }, // e.g., 'ASSIGNED', 'REASSIGNED', 'PICKED_UP', 'DELIVERED', 'FAILED'
    timestamp: { type: Date, default: Date.now },
    
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryHistory', deliveryHistorySchema);
