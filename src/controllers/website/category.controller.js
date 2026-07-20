const Category = require('../../models/category.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

const mapCategory = (cat) => ({
    _id: cat._id,
    name: cat.name,
    slug: cat.slug,
    image_url: cat.image_url,
    description: cat.description,
    status: cat.is_active ? 'active' : 'inactive'
});

exports.getActiveCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ is_active: true }).sort('name');
        res.status(200).json(new ApiResponse(200, { categories: categories.map(mapCategory) }, 'Active categories retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getCategoryBySlug = async (req, res, next) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug, is_active: true });
        if (!category) {
            return next(new ApiError(404, 'Category not found or inactive'));
        }
        res.status(200).json(new ApiResponse(200, { category: mapCategory(category) }, 'Category retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
