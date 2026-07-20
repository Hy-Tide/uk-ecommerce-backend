const Brand = require('../../models/brand.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

const mapBrand = (brand) => ({
    _id: brand._id,
    name: brand.name,
    slug: brand.slug,
    image_url: brand.image_url,
    description: brand.description
});

exports.getActiveBrands = async (req, res, next) => {
    try {
        const brands = await Brand.find({ is_active: true }).sort('name');
        res.status(200).json(new ApiResponse(200, { brands: brands.map(mapBrand) }, 'Active brands retrieved successfully'));
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
        res.status(200).json(new ApiResponse(200, { brand: mapBrand(brand) }, 'Brand retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
