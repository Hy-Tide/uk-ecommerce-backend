const SubCategory = require('../../models/sub_category.model');
const Category = require('../../models/category.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

const mapSubCategory = (sub) => ({
    _id: sub._id,
    category_id: sub.category_id,
    name: sub.name,
    slug: sub.slug,
    image_url: sub.image_url,
    status: sub.status
});

exports.getSubCategoriesByCategory = async (req, res, next) => {
    try {
        const categorySlug = req.params.categorySlug;
        const category = await Category.findOne({ slug: categorySlug, is_active: true });
        if (!category) {
            return next(new ApiError(404, 'Category not found or inactive'));
        }

        const subCategories = await SubCategory.find({ category_id: category._id, status: 'active' }).sort('name');
        res.status(200).json(new ApiResponse(200, { subCategories: subCategories.map(mapSubCategory) }, 'Subcategories retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
