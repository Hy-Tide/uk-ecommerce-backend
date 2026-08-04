const { body } = require('express-validator');

exports.bannerValidator = [
    body('title').trim().notEmpty().withMessage('Banner title is required'),
    body('image_url').trim().notEmpty().withMessage('Banner image URL is required').isURL().withMessage('Please provide a valid URL for the image'),
    body('link').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];
