const { body } = require('express-validator');

exports.subCategoryValidator = [
    body('category_id').notEmpty().withMessage('Category ID is required').isMongoId().withMessage('Invalid Category ID'),
    body('name').trim().notEmpty().withMessage('Subcategory name is required').isLength({ min: 2 }).withMessage('Subcategory name must be at least 2 characters long'),
    body('slug').optional().isString().trim(),
    body('description').optional().trim(),
    body('image').optional().trim().isURL().withMessage('Please provide a valid URL for the image'),
    body('image_url').optional().trim().isURL().withMessage('Please provide a valid URL for the image'),
    body('displayOrder').optional().isNumeric().withMessage('displayOrder must be a number'),
    body('status').optional().isIn(['Active', 'Inactive']).withMessage('status must be either Active or Inactive')
];
