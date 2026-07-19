const Brand = require('../../models/brand.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

exports.createBrand = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const existingBrand = await Brand.findOne({ name: req.body.name });
        if (existingBrand) {
            return next(new ApiError(409, 'Brand with this name already exists'));
        }

        const brand = await Brand.create(req.body);
        res.status(201).json(new ApiResponse(201, { brand }, 'Brand created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllBrands = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, status } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        if (status) {
            query.is_active = status === 'active';
        }

        const skip = (page - 1) * limit;

        const brands = await Brand.find(query).skip(skip).limit(parseInt(limit)).sort('-createdAt');
        const total = await Brand.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            brands,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Brands retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getBrandById = async (req, res, next) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return next(new ApiError(404, 'Brand not found'));
        }
        res.status(200).json(new ApiResponse(200, { brand }, 'Brand retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateBrand = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        if (req.body.name) {
            const existingBrand = await Brand.findOne({ name: req.body.name, _id: { $ne: req.params.id } });
            if (existingBrand) {
                return next(new ApiError(409, 'Brand with this name already exists'));
            }
        }

        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return next(new ApiError(404, 'Brand not found'));
        }

        Object.assign(brand, req.body);
        await brand.save();

        res.status(200).json(new ApiResponse(200, { brand }, 'Brand updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteBrand = async (req, res, next) => {
    try {
        // In a real scenario, you'd check if products are linked before deleting
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            return next(new ApiError(404, 'Brand not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Brand deleted successfully'));
    } catch (error) {
        next(error);
    }
};
