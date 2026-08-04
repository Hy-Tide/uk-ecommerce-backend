const { body } = require('express-validator');

exports.testimonialValidator = [
    body('customerName').trim().notEmpty().withMessage('Customer name is required'),
    body('content').trim().notEmpty().withMessage('Testimonial content is required'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('image_url').optional().trim().isURL().withMessage('Please provide a valid URL for the image'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];
