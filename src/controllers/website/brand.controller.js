const Brand = require('../../models/brand.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getActiveBrands = async (req, res, next) => {
    try {
        const brands = await Brand.find({ is_active: true }).sort('name');
        res.status(200).json(new ApiResponse(200, { brands }, 'Active brands retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getBrandBySlug = async (req, res, next) => {
    try {
        const brand = await Brand.findOne({ slug: req.params.slug, is_active: true });
        if (!brand) {
            return next(new ApiError(404, 'Brand not found or inactive'));
        }
        res.status(200).json(new ApiResponse(200, { brand }, 'Brand retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
