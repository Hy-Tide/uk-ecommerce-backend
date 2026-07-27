const { body } = require('express-validator');

exports.createCouponValidator = [
    body('code').notEmpty().withMessage('Coupon code is required').isString().trim(),
    body('discountType').notEmpty().withMessage('Discount type is required').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('discountValue').notEmpty().withMessage('Discount value is required').isNumeric(),
    body('minPurchaseAmount').optional().isNumeric(),
    body('maxDiscountAmount').optional().isNumeric(),
    body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    body('isActive').optional().isBoolean(),
    body('usageLimit').optional().isNumeric()
];

exports.updateCouponValidator = [
    body('code').optional().isString().trim(),
    body('discountType').optional().isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
    body('discountValue').optional().isNumeric(),
    body('minPurchaseAmount').optional().isNumeric(),
    body('maxDiscountAmount').optional().isNumeric(),
    body('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    body('isActive').optional().isBoolean(),
    body('usageLimit').optional().isNumeric()
];

exports.updateStatusValidator = [
    body('isActive').notEmpty().isBoolean().withMessage('isActive must be a boolean')
];
