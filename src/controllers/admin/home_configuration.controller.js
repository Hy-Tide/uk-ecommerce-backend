const HomeConfiguration = require('../../models/home_configuration.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

exports.createSection = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const section = await HomeConfiguration.create(req.body);
        res.status(201).json(new ApiResponse(201, { section }, 'Home configuration section created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllSections = async (req, res, next) => {
    try {
        const sections = await HomeConfiguration.find().sort('displayOrder createdAt');
        res.status(200).json(new ApiResponse(200, { sections }, 'Home configuration sections retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getSectionById = async (req, res, next) => {
    try {
        const section = await HomeConfiguration.findById(req.params.id)
            .populate('selectedProductIds', 'name slug images inStock')
            .populate('categoryIds', 'name slug image')
            .populate('subCategoryIds', 'name slug')
            .populate('brandIds', 'name slug image_url')
            .populate('recipeIds', 'title image_url')
            .populate('testimonialIds', 'customerName content rating')
            .populate('bannerIds', 'title image_url link');
            
        if (!section) {
            return next(new ApiError(404, 'Section not found'));
        }
        res.status(200).json(new ApiResponse(200, { section }, 'Section retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateSection = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const section = await HomeConfiguration.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!section) {
            return next(new ApiError(404, 'Section not found'));
        }

        res.status(200).json(new ApiResponse(200, { section }, 'Section updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteSection = async (req, res, next) => {
    try {
        const section = await HomeConfiguration.findByIdAndDelete(req.params.id);
        if (!section) {
            return next(new ApiError(404, 'Section not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Section deleted successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateDisplayOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const { items } = req.body;
        
        // Bulk update
        const operations = items.map(item => ({
            updateOne: {
                filter: { _id: item.id },
                update: { displayOrder: item.displayOrder }
            }
        }));

        await HomeConfiguration.bulkWrite(operations);

        res.status(200).json(new ApiResponse(200, null, 'Display order updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.toggleSectionStatus = async (req, res, next) => {
    try {
        const section = await HomeConfiguration.findById(req.params.id);
        if (!section) {
            return next(new ApiError(404, 'Section not found'));
        }

        section.enabled = !section.enabled;
        await section.save();

        res.status(200).json(new ApiResponse(200, { enabled: section.enabled }, 'Section status updated successfully'));
    } catch (error) {
        next(error);
    }
};
