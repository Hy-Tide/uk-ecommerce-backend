const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variationId: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
    billingAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    subTotal: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    orderStatus: { type: String, enum: ['Pending', 'Confirmed', 'Preparing', 'Ready For Delivery', 'Delivered', 'Cancelled'], default: 'Pending' },
    deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
