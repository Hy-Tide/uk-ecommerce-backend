const Banner = require('../../models/banner.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

exports.createBanner = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const banner = await Banner.create(req.body);
        res.status(201).json(new ApiResponse(201, { banner }, 'Banner created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllBanners = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, status } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        
        if (status) {
            query.is_active = status === 'active';
        }

        const skip = (page - 1) * limit;

        const banners = await Banner.find(query).skip(skip).limit(parseInt(limit)).sort('-createdAt');
        const total = await Banner.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            banners,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Banners retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getBannerById = async (req, res, next) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return next(new ApiError(404, 'Banner not found'));
        }
        res.status(200).json(new ApiResponse(200, { banner }, 'Banner retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateBanner = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!banner) {
            return next(new ApiError(404, 'Banner not found'));
        }

        res.status(200).json(new ApiResponse(200, { banner }, 'Banner updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) {
            return next(new ApiError(404, 'Banner not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Banner deleted successfully'));
    } catch (error) {
        next(error);
    }
};
