const { body } = require('express-validator');

exports.assignDeliveryValidator = [
    body('orderId').trim().notEmpty().withMessage('Order ID is required'),
    body('deliveryPartnerId').trim().notEmpty().withMessage('Delivery Partner ID is required'),
    body('notes').optional().isString().trim()
];

exports.updateDeliveryStatusValidator = [
    body('status').isIn(['ACCEPTED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'CANCELLED']).withMessage('Invalid delivery status'),
    body('notes').optional().isString().trim()
];
