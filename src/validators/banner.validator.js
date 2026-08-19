const { body } = require('express-validator');

exports.bannerValidator = [
    body('title').trim().notEmpty().withMessage('Banner title is required'),
    body('pageType').isIn(['home', 'offers', 'blogs', 'recipes', 'contact-us']).withMessage('Invalid pageType'),
    body('image_url').optional().trim(),
    body('link').optional().trim(),
    body('description').optional().trim(),
    body('is_active').optional().isBoolean().withMessage('is_active must be a boolean')
];
