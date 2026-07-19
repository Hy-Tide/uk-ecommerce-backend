const { body } = require('express-validator');

exports.categoryValidator = [
    body('name').trim().notEmpty().withMessage('Category name is required').isLength({ min: 2 }).withMessage('Category name must be at least 2 characters long'),
    body('description').optional().trim(),
    body('image_url').optional().trim().isURL().withMessage('Please provide a valid URL for the image'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];
