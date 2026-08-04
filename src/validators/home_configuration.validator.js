const { body } = require('express-validator');

exports.homeConfigurationValidator = [
    body('sectionType').trim().notEmpty().withMessage('Section type is required').isIn([
        'Hero Banner', 'Feature Highlights', 'Promotional Banner Grid', 'Categories', 
        'Best Deals', 'Limited Products', 'Recommended Products', 'New Arrivals', 
        'Recently Viewed', 'Featured Products', 'Trending Products', 'Best Sellers', 
        'Brands', 'Recipes', 'Testimonials', 'Why Choose Us', 'Newsletter'
    ]).withMessage('Invalid section type'),
    body('title').optional().trim(),
    body('subtitle').optional().trim(),
    body('enabled').optional().isBoolean().withMessage('Enabled must be a boolean'),
    body('displayOrder').notEmpty().withMessage('Display order is required').isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
    body('dataSource').optional().isIn(['Manual', 'Automatic']).withMessage('DataSource must be Manual or Automatic'),
    body('productLimit').optional().isInt({ min: 1 }).withMessage('Product limit must be at least 1'),
    body('filters').optional().isObject().withMessage('Filters must be an object'),
    body('buttonText').optional().trim(),
    body('buttonUrl').optional().trim(),
    body('selectedProductIds').optional().isArray().withMessage('Selected products must be an array'),
    body('categoryIds').optional().isArray().withMessage('Category IDs must be an array'),
    body('subCategoryIds').optional().isArray().withMessage('SubCategory IDs must be an array'),
    body('brandIds').optional().isArray().withMessage('Brand IDs must be an array'),
    body('recipeIds').optional().isArray().withMessage('Recipe IDs must be an array'),
    body('testimonialIds').optional().isArray().withMessage('Testimonial IDs must be an array'),
    body('bannerIds').optional().isArray().withMessage('Banner IDs must be an array')
];

exports.reorderValidator = [
    body('items').isArray({ min: 1 }).withMessage('Items array is required'),
    body('items.*.id').notEmpty().withMessage('Item ID is required'),
    body('items.*.displayOrder').isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
];
