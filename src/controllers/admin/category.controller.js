const Category = require('../../models/category.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

const mapCategory = (cat) => ({
    _id: cat._id,
    name: cat.name,
    slug: cat.slug,
    image_url: cat.image_url,
    description: cat.description,
    status: cat.is_active ? 'active' : 'inactive'
});

exports.createCategory = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const existingCategory = await Category.findOne({ name: req.body.name });
        if (existingCategory) {
            return next(new ApiError(409, 'Category with this name already exists'));
        }

        const category = await Category.create(req.body);
        res.status(201).json(new ApiResponse(201, { category: mapCategory(category) }, 'Category created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllCategories = async (req, res, next) => {
    try {
        // Simple search and pagination
        const { search, page = 1, limit = 10, status } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        if (status) {
            query.is_active = status === 'active';
        }

        const skip = (page - 1) * limit;

        const categories = await Category.find(query).skip(skip).limit(parseInt(limit)).sort('-createdAt');
        const total = await Category.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            categories: categories.map(mapCategory),
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Categories retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return next(new ApiError(404, 'Category not found'));
        }
        res.status(200).json(new ApiResponse(200, { category: mapCategory(category) }, 'Category retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        if (req.body.name) {
            const existingCategory = await Category.findOne({ name: req.body.name, _id: { $ne: req.params.id } });
            if (existingCategory) {
                return next(new ApiError(409, 'Category with this name already exists'));
            }
        }

        // We use findById and then save() to trigger the pre-save hook for slug regeneration if name changed
        const category = await Category.findById(req.params.id);
        if (!category) {
            return next(new ApiError(404, 'Category not found'));
        }

        Object.assign(category, req.body);
        await category.save();

        res.status(200).json(new ApiResponse(200, { category: mapCategory(category) }, 'Category updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        // In a real scenario, you'd check if products are linked to this category before deleting
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return next(new ApiError(404, 'Category not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
    } catch (error) {
        next(error);
    }
};
