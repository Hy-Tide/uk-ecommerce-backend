const Category = require('../../models/category.model');
const SubCategory = require('../../models/sub_category.model');
const Brand = require('../../models/brand.model');
const Offer = require('../../models/offer.model');
const Recipe = require('../../models/recipe.model');
const BlogCategory = require('../../models/blog_category.model');
const Setting = require('../../models/setting.model');
const ApiResponse = require('../../utils/ApiResponse');

exports.getNavigationData = async (req, res, next) => {
    try {
        // Fetch all active categories and subcategories
        const categoriesPromise = Category.find({ status: 'Active' })
            .sort({ displayOrder: 1, createdAt: -1 })
            .select('_id name slug image icon displayOrder')
            .lean();

        const subCategoriesPromise = SubCategory.find({ status: 'Active' })
            .sort({ displayOrder: 1, createdAt: -1 })
            .select('_id category_id name slug image image_url displayOrder')
            .lean();

        // Fetch other active items for the navbar dropdowns
        const brandsPromise = Brand.find({ is_active: true })
            .sort({ name: 1 })
            .select('_id name slug image_url')
            .lean();

        const offersPromise = Offer.find({ isActive: true })
            .sort({ createdAt: -1 })
            .select('_id title discountType discountValue')
            .limit(10) // Limit to top 10 recent offers
            .lean();

        const recipesPromise = Recipe.find({ is_active: true })
            .sort({ createdAt: -1 })
            .select('_id title image_url')
            .limit(10) // Limit to top 10 recent recipes
            .lean();

        const blogCategoriesPromise = BlogCategory.find({ isActive: true })
            .sort({ displayOrder: 1 })
            .select('_id name slug displayOrder')
            .lean();

        const settingsPromise = Setting.findOne()
            .select('supportEmail phone whatsappNumber')
            .lean();

        const [
            categories,
            subCategories,
            brands,
            offers,
            recipes,
            blogCategories,
            setting
        ] = await Promise.all([
            categoriesPromise,
            subCategoriesPromise,
            brandsPromise,
            offersPromise,
            recipesPromise,
            blogCategoriesPromise,
            settingsPromise
        ]);

        // Map subcategories to their respective categories
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat._id.toString()] = {
                ...cat,
                subcategories: []
            };
        });

        subCategories.forEach(sub => {
            if (sub.category_id && categoryMap[sub.category_id.toString()]) {
                categoryMap[sub.category_id.toString()].subcategories.push(sub);
            }
        });

        const assembledCategories = Object.values(categoryMap).sort((a, b) => a.displayOrder - b.displayOrder);

        const navigationData = {
            categories: assembledCategories,
            brands,
            offers,
            recipes,
            blogCategories,
            contactInfo: {
                email: setting?.supportEmail || '',
                phone: setting?.phone || '',
                whatsapp: setting?.whatsappNumber || ''
            }
        };

        res.status(200).json(new ApiResponse(200, navigationData, 'Navigation data retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
