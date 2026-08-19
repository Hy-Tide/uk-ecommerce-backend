const { body } = require('express-validator');

exports.homeConfigurationValidator = [
    body('sectionType').trim().notEmpty().withMessage('Section type is required').isIn([
        'Hero Banner', 'Service Features', 'Offer Banners', 'Shop by Categories',
        'Today\'s Best Deals', 'Limited Products', 'Recommended Products', 'New Arrivals',
        'Recently Viewed', 'Subscription Banner', 'Shop by Brands', 'Popular Recipes',
        'Testimonials', 'Why Choose Us', 'Newsletter'
    ]).withMessage('Invalid section type'),
    body('title').optional().trim(),
    body('subtitle').optional().trim(),
    body('enabled').optional().isBoolean().withMessage('Enabled must be a boolean'),
    body('displayOrder').notEmpty().withMessage('Display order is required').isInt({ min: 0 }).withMessage('Display order must be a non-negative integer'),
    body('dataSource').optional().isIn(['Featured Products', 'Latest Products', 'Manual Selection', 'Category Based', 'Brand Based', 'Offer Products', 'Manual', 'Automatic', 'manual', 'automatic']).withMessage('Invalid DataSource'),
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
    body('bannerIds').optional().isArray().withMessage('Banner IDs must be an array'),
    body('highlightTitle').optional().trim(),
    body('description').optional().trim(),
    body('backgroundImage').optional().trim(),
    body('iconImage').optional().trim(),
    body('bannerImage').optional().trim(),
    body('image').optional().trim(),
    body('desktopImage').optional().trim(),
    body('mobileImage').optional().trim(),
    body('primaryButtonText').optional().trim(),
    body('primaryButtonUrl').optional().trim(),
    body('secondaryButtonText').optional().trim(),
    body('secondaryButtonUrl').optional().trim(),
    body('settings').optional().isObject(),
    body('items').optional().isArray()
];

exports.reorderValidator = [
    body('items').isArray({ min: 1 }).withMessage('Items array is required'),
    body('items.*.id').notEmpty().withMessage('Item ID is required'),
    body('items.*.displayOrder').isInt({ min: 0 }).withMessage('Display order must be a non-negative integer')
];
