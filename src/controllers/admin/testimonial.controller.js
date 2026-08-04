const Testimonial = require('../../models/testimonial.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

exports.createTestimonial = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const testimonial = await Testimonial.create(req.body);
        res.status(201).json(new ApiResponse(201, { testimonial }, 'Testimonial created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllTestimonials = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, status } = req.query;
        let query = {};

        if (search) {
            query.customerName = { $regex: search, $options: 'i' };
        }
        
        if (status) {
            query.is_active = status === 'active';
        }

        const skip = (page - 1) * limit;

        const testimonials = await Testimonial.find(query).skip(skip).limit(parseInt(limit)).sort('-createdAt');
        const total = await Testimonial.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            testimonials,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Testimonials retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getTestimonialById = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return next(new ApiError(404, 'Testimonial not found'));
        }
        res.status(200).json(new ApiResponse(200, { testimonial }, 'Testimonial retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateTestimonial = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!testimonial) {
            return next(new ApiError(404, 'Testimonial not found'));
        }

        res.status(200).json(new ApiResponse(200, { testimonial }, 'Testimonial updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteTestimonial = async (req, res, next) => {
    try {
        const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
        if (!testimonial) {
            return next(new ApiError(404, 'Testimonial not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Testimonial deleted successfully'));
    } catch (error) {
        next(error);
    }
};
