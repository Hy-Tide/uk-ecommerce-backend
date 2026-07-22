const SubCategory = require('../../models/sub_category.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

const mapSubCategory = (sub) => ({
    _id: sub._id,
    category_id: sub.category_id,
    name: sub.name,
    slug: sub.slug,
    image: sub.image || sub.image_url,
    description: sub.description,
    displayOrder: sub.displayOrder,
    status: sub.status,
    createdAt: sub.createdAt,
    updatedAt: sub.updatedAt
});

const handleBackwardCompatibility = (body) => {
    const data = { ...body };
    if (data.image_url && !data.image) data.image = data.image_url;
    if (data.status) {
        if (data.status.toLowerCase() === 'active') data.status = 'Active';
        if (data.status.toLowerCase() === 'inactive') data.status = 'Inactive';
    }
    return data;
};

exports.createSubCategory = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const existing = await SubCategory.findOne({ name: req.body.name, category_id: req.body.category_id });
        if (existing) {
            return next(new ApiError(409, 'Subcategory with this name already exists in this category'));
        }

        const data = handleBackwardCompatibility(req.body);
        const subCategory = await SubCategory.create(data);
        res.status(201).json(new ApiResponse(201, { subCategory: mapSubCategory(subCategory) }, 'Subcategory created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllSubCategories = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, status, category_id } = req.query;
        let query = {};

        if (search) query.name = { $regex: search, $options: 'i' };
        if (status) query.status = status;
        if (category_id) query.category_id = category_id;

        const skip = (page - 1) * limit;

        const subCategories = await SubCategory.find(query).skip(skip).limit(parseInt(limit)).sort({ displayOrder: 1, createdAt: -1 });
        const total = await SubCategory.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            subCategories: subCategories.map(mapSubCategory),
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'SubCategories retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getSubCategoryById = async (req, res, next) => {
    try {
        const subCategory = await SubCategory.findById(req.params.id);
        if (!subCategory) {
            return next(new ApiError(404, 'Subcategory not found'));
        }
        res.status(200).json(new ApiResponse(200, { subCategory: mapSubCategory(subCategory) }, 'Subcategory retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateSubCategory = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const subCategory = await SubCategory.findById(req.params.id);
        if (!subCategory) {
            return next(new ApiError(404, 'Subcategory not found'));
        }

        const data = handleBackwardCompatibility(req.body);
        Object.assign(subCategory, data);
        await subCategory.save();

        res.status(200).json(new ApiResponse(200, { subCategory: mapSubCategory(subCategory) }, 'Subcategory updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteSubCategory = async (req, res, next) => {
    try {
        const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
        if (!subCategory) {
            return next(new ApiError(404, 'Subcategory not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Subcategory deleted successfully'));
    } catch (error) {
        next(error);
    }
};
