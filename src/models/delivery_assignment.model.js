const mongoose = require('mongoose');

const deliveryAssignmentSchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPartner', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true },
    
    assignedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    pickedUpAt: { type: Date },
    outForDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    
    deliveryStatus: {
        type: String,
        enum: ['NOT_ASSIGNED', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED'],
        default: 'ASSIGNED'
    },
    
    deliveryNotes: { type: String },
    isCurrent: { type: Boolean, default: true } // false if the order was reassigned to someone else
}, { timestamps: true });

module.exports = mongoose.model('DeliveryAssignment', deliveryAssignmentSchema);
