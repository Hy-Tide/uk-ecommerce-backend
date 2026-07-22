const Category = require('../../models/category.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

const mapCategory = (cat) => ({
    _id: cat._id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image || cat.image_url,
    icon: cat.icon
});

exports.getActiveCategories = async (req, res, next) => {
    try {
        // Fetch only active categories, sort by displayOrder
        const categories = await Category.find({ status: 'Active' }).sort({ displayOrder: 1, createdAt: -1 });
        res.status(200).json(new ApiResponse(200, { categories: categories.map(mapCategory) }, 'Active categories retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getCategoryBySlug = async (req, res, next) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug, status: 'Active' });
        if (!category) {
            return next(new ApiError(404, 'Category not found or inactive'));
        }
        res.status(200).json(new ApiResponse(200, { category: mapCategory(category) }, 'Category retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
