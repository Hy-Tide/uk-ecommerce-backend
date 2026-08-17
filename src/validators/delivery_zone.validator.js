const { body } = require('express-validator');

exports.deliveryZoneValidator = [
    body('name').trim().notEmpty().withMessage('Delivery zone name is required').isLength({ min: 2 }).withMessage('Delivery zone name must be at least 2 characters long'),
    body('description').optional().trim(),
    body('shapeType').isIn(['polygon', 'circle']).withMessage('shapeType must be either polygon or circle'),
    
    // Polygon validation
    body('coordinates').if(body('shapeType').equals('polygon'))
        .isArray().withMessage('coordinates must be an array')
        .notEmpty().withMessage('coordinates cannot be empty for polygon'),
    body('coordinates.*').if(body('shapeType').equals('polygon'))
        .isArray().withMessage('coordinates must contain arrays of rings'),
    
    // Circle validation
    body('center').if(body('shapeType').equals('circle'))
        .isArray({ min: 2, max: 2 }).withMessage('center must be an array of [longitude, latitude]'),
    body('radius').if(body('shapeType').equals('circle'))
        .isNumeric().withMessage('radius must be a number in meters')
        .custom(value => value > 0).withMessage('radius must be greater than 0'),

    body('deliveryCharge').optional().isNumeric().withMessage('deliveryCharge must be a number'),
    body('minimumOrderValue').optional().isNumeric().withMessage('minimumOrderValue must be a number'),
    body('estimatedDeliveryTime').optional().isString().trim(),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
];
