const Coupon = require('../../models/coupon.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

exports.createCoupon = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const data = req.body;
        data.code = data.code.toUpperCase();

        const existingCoupon = await Coupon.findOne({ code: data.code });
        if (existingCoupon) {
            return next(new ApiError(409, 'Coupon code already exists'));
        }

        const coupon = await Coupon.create(data);
        res.status(201).json(new ApiResponse(201, { coupon }, 'Coupon created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllCoupons = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, isActive } = req.query;
        let query = {};

        if (search) {
            query.code = { $regex: search, $options: 'i' };
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const skip = (page - 1) * limit;

        const coupons = await Coupon.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
        const total = await Coupon.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            coupons,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Coupons retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getCouponById = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return next(new ApiError(404, 'Coupon not found'));
        }
        res.status(200).json(new ApiResponse(200, { coupon }, 'Coupon retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateCoupon = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const data = req.body;
        if (data.code) data.code = data.code.toUpperCase();

        if (data.code) {
            const existingCoupon = await Coupon.findOne({ code: data.code, _id: { $ne: req.params.id } });
            if (existingCoupon) {
                return next(new ApiError(409, 'Coupon code already exists'));
            }
        }

        const coupon = await Coupon.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
        if (!coupon) {
            return next(new ApiError(404, 'Coupon not found'));
        }

        res.status(200).json(new ApiResponse(200, { coupon }, 'Coupon updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateCouponStatus = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const { isActive } = req.body;
        
        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) {
            return next(new ApiError(404, 'Coupon not found'));
        }

        coupon.isActive = isActive;
        await coupon.save();

        res.status(200).json(new ApiResponse(200, { coupon }, 'Coupon status updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return next(new ApiError(404, 'Coupon not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Coupon deleted successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getCouponUsageReport = async (req, res, next) => {
    try {
        // A simple usage report returning global stats of all coupons
        const totalCoupons = await Coupon.countDocuments();
        const activeCoupons = await Coupon.countDocuments({ isActive: true });
        
        // Aggregate to find total usage across all coupons
        const usageStats = await Coupon.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsage: { $sum: "$usedCount" }
                }
            }
        ]);
        
        const topUsedCoupons = await Coupon.find().sort({ usedCount: -1 }).limit(5);

        res.status(200).json(new ApiResponse(200, { 
            report: {
                totalCoupons,
                activeCoupons,
                totalUsage: usageStats[0]?.totalUsage || 0,
                topUsedCoupons
            } 
        }, 'Coupon usage report retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
