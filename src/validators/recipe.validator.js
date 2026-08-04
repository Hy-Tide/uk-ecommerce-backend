const { body } = require('express-validator');

exports.recipeValidator = [
    body('title').trim().notEmpty().withMessage('Recipe title is required'),
    body('description').trim().notEmpty().withMessage('Recipe description is required'),
    body('image_url').optional().trim().isURL().withMessage('Please provide a valid URL for the image'),
    body('ingredients').optional().isArray().withMessage('Ingredients must be an array'),
    body('instructions').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];
