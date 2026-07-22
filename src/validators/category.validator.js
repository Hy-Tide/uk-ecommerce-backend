const { body } = require('express-validator');

exports.categoryValidator = [
    body('name').trim().notEmpty().withMessage('Category name is required').isLength({ min: 2 }).withMessage('Category name must be at least 2 characters long'),
    body('slug').optional().isString().trim(),
    body('description').optional().trim(),
    body('image').optional().trim().isURL().withMessage('Please provide a valid URL for the image'),
    body('image_url').optional().trim().isURL().withMessage('Please provide a valid URL for the image'),
    body('icon').optional().isString().trim(),
    body('displayOrder').optional().isNumeric().withMessage('displayOrder must be a number'),
    body('status').optional().isIn(['Active', 'Inactive']).withMessage('status must be either Active or Inactive'),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    body('seoTitle').optional().isString().trim(),
    body('seoDescription').optional().isString().trim()
];
