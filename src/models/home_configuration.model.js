const mongoose = require('mongoose');

const homeConfigurationSchema = new mongoose.Schema({
    sectionType: {
        type: String,
        required: [true, 'Section type is required'],
        enum: [
            'Hero Banner', 'Feature Highlights', 'Promotional Banner Grid', 'Categories', 
            'Best Deals', 'Limited Products', 'Recommended Products', 'New Arrivals', 
            'Recently Viewed', 'Featured Products', 'Trending Products', 'Best Sellers', 
            'Brands', 'Recipes', 'Testimonials', 'Why Choose Us', 'Newsletter'
        ]
    },
    title: {
        type: String,
        trim: true
    },
    subtitle: {
        type: String,
        trim: true
    },
    enabled: {
        type: Boolean,
        default: true
    },
    displayOrder: {
        type: Number,
        required: [true, 'Display order is required'],
        default: 0
    },
    dataSource: {
        type: String,
        enum: ['Manual', 'Automatic'],
        default: 'Automatic'
    },
    productLimit: {
        type: Number,
        default: 10
    },
    filters: {
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
        brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
        productTag: String,
        discountPercentage: Number,
        stockStatus: String, // e.g., 'in_stock', 'low_stock'
        newArrival: Boolean,
        featured: Boolean,
        bestSeller: Boolean
    },
    buttonText: {
        type: String,
        trim: true
    },
    buttonUrl: {
        type: String,
        trim: true
    },
    // Manual selection fields
    selectedProductIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    categoryIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    subCategoryIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory'
    }],
    brandIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    }],
    recipeIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe'
    }],
    testimonialIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Testimonial'
    }],
    bannerIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Banner'
    }]
}, { timestamps: true });

module.exports = mongoose.model('HomeConfiguration', homeConfigurationSchema);
