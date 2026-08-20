const HomeConfiguration = require('../models/home_configuration.model');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const SubCategory = require('../models/sub_category.model');
const Brand = require('../models/brand.model');
const Recipe = require('../models/recipe.model');
const Testimonial = require('../models/testimonial.model');
const Banner = require('../models/banner.model');

/**
 * Resolves the data for a given home configuration section
 */
exports.resolveSectionData = async (section) => {
    let data = [];

    // Helper to conditionally apply filters
    const applyProductFilters = (queryObj) => {
        if (section.filters) {
            if (section.filters.category) queryObj.category = section.filters.category;
            if (section.filters.subcategory) queryObj.subCategory = section.filters.subcategory;
            if (section.filters.brand) queryObj.brand = section.filters.brand;
            // Assuming Product model has a tags array or similar, adjust if needed
            // if (section.filters.productTag) queryObj.tags = section.filters.productTag;
            if (section.filters.newArrival) queryObj.isNew = true; // Assuming a boolean
            if (section.filters.featured) queryObj.isFeatured = true; // Assuming a boolean
            // Best seller / Discount logic could be complex depending on schema. 
        }
        return queryObj;
    };

    if (['Manual', 'manual', 'Manual Selection'].includes(section.dataSource)) {
        // Fetch manually selected IDs based on section type
        switch (section.sectionType) {
            case 'Shop by Categories':
                if (section.categoryIds && section.categoryIds.length > 0) {
                    data = await Category.find({ _id: { $in: section.categoryIds }, status: 'Active' }).select('-description');
                }
                break;
            case 'Shop by Brands':
                if (section.brandIds && section.brandIds.length > 0) {
                    data = await Brand.find({ _id: { $in: section.brandIds }, is_active: true }).select('-description');
                }
                break;
            case 'Popular Recipes':
                if (section.recipeIds && section.recipeIds.length > 0) {
                    data = await Recipe.find({ _id: { $in: section.recipeIds }, is_active: true }).select('-description -instructions');
                }
                break;
            case 'Testimonials':
                if (section.testimonialIds && section.testimonialIds.length > 0) {
                    data = await Testimonial.find({ _id: { $in: section.testimonialIds }, is_active: true });
                }
                break;
            case 'Hero Banner':
            case 'Promotional Banner Grid':
                if (section.bannerIds && section.bannerIds.length > 0) {
                    data = await Banner.find({ _id: { $in: section.bannerIds }, is_active: true }).select('-description');
                }
                break;
            default:
                // For all product-based sections (Best Deals, Limited Products, etc.)
                if (section.selectedProductIds && section.selectedProductIds.length > 0) {
                    data = await Product.find({ _id: { $in: section.selectedProductIds }, status: 'active' })
                        .select('name slug images price variations inStock isFeatured');
                }
                break;
        }
    } else {
        // Automatic data sourcing
        let queryObj = { status: 'active' }; // Assumes status active is standard for products
        
        switch (section.sectionType) {
            case "Today's Best Deals":
                queryObj = applyProductFilters(queryObj);
                // In a real app, you might sort by discount percentage calculated via aggregation
                data = await Product.find(queryObj)
                    .sort('-createdAt') // Simplified: just latest for now
                    .limit(section.productLimit)
                    .select('name slug images price variations inStock');
                break;
            
            case 'New Arrivals':
                queryObj = applyProductFilters(queryObj);
                data = await Product.find(queryObj)
                    .sort('-createdAt')
                    .limit(section.productLimit)
                    .select('name slug images price variations inStock');
                break;
            
            case 'Featured Products':
                queryObj.isFeatured = true;
                queryObj = applyProductFilters(queryObj);
                data = await Product.find(queryObj)
                    .sort('-createdAt')
                    .limit(section.productLimit)
                    .select('name slug images price variations inStock');
                break;
                
            case 'Limited Products':
                queryObj = applyProductFilters(queryObj);
                // Find products where stock is low across variations or root level
                data = await Product.find(queryObj)
                    .sort('inStock') // Assuming inStock is a boolean, or if it's a number, sort ascending
                    .limit(section.productLimit)
                    .select('name slug images price variations inStock');
                break;

            case 'Best Sellers':
            case 'Trending Products':
            case 'Recommended Products':
            case 'Recently Viewed':
                queryObj = applyProductFilters(queryObj);
                // Placeholder: Use latest as a fallback since complex analytics are not strictly defined
                data = await Product.find(queryObj)
                    .sort('-createdAt')
                    .limit(section.productLimit)
                    .select('name slug images price variations inStock');
                break;
                
            case 'Shop by Categories':
                data = await Category.find({ status: 'Active' }).select('-description').limit(section.productLimit || 10);
                break;
                
            case 'Shop by Brands':
                data = await Brand.find({ is_active: true }).select('-description').limit(section.productLimit || 10);
                break;
                
            case 'Popular Recipes':
                data = await Recipe.find({ is_active: true }).sort('-createdAt').select('-description -instructions').limit(section.productLimit || 4);
                break;

            case 'Testimonials':
                data = await Testimonial.find({ is_active: true }).sort('-createdAt').limit(section.productLimit || 5);
                break;

            case 'Hero Banner':
            case 'Promotional Banner Grid':
                data = await Banner.find({ is_active: true }).sort('-createdAt').select('-description').limit(section.productLimit || 3);
                break;
                
            default:
                break;
        }
    }

    return {
        _id: section._id,
        sectionType: section.sectionType,
        title: section.title,
        highlightTitle: section.highlightTitle,
        subtitle: section.subtitle,
        description: section.description,
        backgroundImage: section.backgroundImage,
        iconImage: section.iconImage,
        bannerImage: section.bannerImage,
        primaryButtonText: section.primaryButtonText,
        primaryButtonUrl: section.primaryButtonUrl,
        secondaryButtonText: section.secondaryButtonText,
        secondaryButtonUrl: section.secondaryButtonUrl,
        displayOrder: section.displayOrder,
        buttonText: section.buttonText,
        buttonUrl: section.buttonUrl,
        settings: section.settings,
        items: section.items,
        data: data
    };
};
