const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variationId: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
});

const orderAddressSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    houseNumber: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    county: { type: String },
    postcode: { type: String, required: true },
    addressType: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: { type: orderAddressSchema, required: true },
    billingAddress: { type: orderAddressSchema },
    deliveryNotes: { type: String },
    deliverySlot: { type: String },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    subTotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Ready For Delivery', 'Delivered', 'Cancelled'], default: 'Pending' },
    deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }, // legacy
    
    activeDeliveryAssignment: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAssignment' },
    deliveryStatus: {
        type: String,
        enum: ['NOT_ASSIGNED', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED'],
        default: 'NOT_ASSIGNED'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
