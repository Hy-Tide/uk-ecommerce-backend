const { body } = require('express-validator');

exports.deliveryPartnerValidator = [
    body('name').trim().notEmpty().withMessage('Partner name is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('vehicleType').optional().isString().trim(),
    body('vehicleNumber').optional().isString().trim(),
    body('isActive').optional().isBoolean()
];
