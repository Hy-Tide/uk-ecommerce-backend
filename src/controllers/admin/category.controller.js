const Category = require('../../models/category.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

const mapCategory = (cat) => ({
    _id: cat._id,
    name: cat.name,
    slug: cat.slug,
    image: cat.image || cat.image_url,
    icon: cat.icon,
    description: cat.description,
    displayOrder: cat.displayOrder,
    status: cat.status,
    is_active: cat.status === 'Active', // For backwards compatibility
    seoTitle: cat.seoTitle,
    seoDescription: cat.seoDescription,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt
});

const handleBackwardCompatibility = (body) => {
    const data = { ...body };
    if (data.image_url && !data.image) data.image = data.image_url;
    if (data.is_active !== undefined && !data.status) {
        data.status = data.is_active ? 'Active' : 'Inactive';
    }
    return data;
};

exports.createCategory = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const data = handleBackwardCompatibility(req.body);

        const existingCategory = await Category.findOne({ name: data.name });
        if (existingCategory) {
            return next(new ApiError(409, 'Category with this name already exists'));
        }

        if (data.slug) {
            const existingSlug = await Category.findOne({ slug: data.slug });
            if (existingSlug) {
                return next(new ApiError(409, 'Category with this slug already exists'));
            }
        }

        const category = await Category.create(data);
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
            // handle both 'active' and 'Active'
            if (status.toLowerCase() === 'active') {
                query.status = 'Active';
            } else if (status.toLowerCase() === 'inactive') {
                query.status = 'Inactive';
            }
        }

        const skip = (page - 1) * limit;

        const categories = await Category.find(query).skip(skip).limit(parseInt(limit)).sort({ displayOrder: 1, createdAt: -1 });
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

        const data = handleBackwardCompatibility(req.body);

        if (data.name) {
            const existingCategory = await Category.findOne({ name: data.name, _id: { $ne: req.params.id } });
            if (existingCategory) {
                return next(new ApiError(409, 'Category with this name already exists'));
            }
        }
        
        if (data.slug) {
            const existingSlug = await Category.findOne({ slug: data.slug, _id: { $ne: req.params.id } });
            if (existingSlug) {
                return next(new ApiError(409, 'Category with this slug already exists'));
            }
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            return next(new ApiError(404, 'Category not found'));
        }

        Object.assign(category, data);
        await category.save();

        res.status(200).json(new ApiResponse(200, { category: mapCategory(category) }, 'Category updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return next(new ApiError(404, 'Category not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
    } catch (error) {
        next(error);
    }
};
