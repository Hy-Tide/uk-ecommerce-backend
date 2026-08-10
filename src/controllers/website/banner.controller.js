const Banner = require('../../models/banner.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

const getBannersByType = async (pageType, res, next) => {
    try {
        const banners = await Banner.find({ pageType, is_active: true }).sort('-createdAt');
        res.status(200).json(new ApiResponse(200, { banners }, `${pageType} banners retrieved successfully`));
    } catch (error) {
        next(error);
    }
};

exports.getOfferBanners = async (req, res, next) => {
    return getBannersByType('offers', res, next);
};

exports.getBlogBanners = async (req, res, next) => {
    return getBannersByType('blogs', res, next);
};

exports.getRecipeBanners = async (req, res, next) => {
    return getBannersByType('recipes', res, next);
};

exports.getContactUsBanners = async (req, res, next) => {
    return getBannersByType('contact-us', res, next);
};
