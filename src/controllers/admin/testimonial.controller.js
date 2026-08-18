const Testimonial = require('../../models/testimonial.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const { processBase64Images } = require('../../utils/base64Helper');

exports.createTestimonial = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        if (req.body.image_url) {
            req.body.image_url = await processBase64Images(req.body.image_url, baseUrl);
        }

        if (req.file) {
            req.body.image_url = `${baseUrl}/uploads/${req.file.filename}`;
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

        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return next(new ApiError(404, 'Testimonial not found'));
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        if (req.body.image_url) {
            req.body.image_url = await processBase64Images(req.body.image_url, baseUrl);
        }

        if (req.file) {
            req.body.image_url = `${baseUrl}/uploads/${req.file.filename}`;
            
            const oldImage = testimonial.image_url;
            if (oldImage && oldImage.includes('/uploads/')) {
                const oldFilename = oldImage.split('/uploads/')[1];
                const oldFilePath = path.join(__dirname, '../../../uploads', oldFilename);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
        }

        Object.assign(testimonial, req.body);
        await testimonial.save();



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
