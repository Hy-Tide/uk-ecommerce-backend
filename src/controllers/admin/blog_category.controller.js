const BlogCategory = require('../../models/blog_category.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const fs = require('fs');
const path = require('path');

exports.createBlogCategory = async (req, res, next) => {
    try {
        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            req.body.image = `${baseUrl}/uploads/${req.file.filename}`;
        }
        const category = await BlogCategory.create(req.body);
        res.status(201).json(new ApiResponse(201, { category }, 'Blog category created successfully'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'Blog category slug already exists'));
        }
        next(error);
    }
};

exports.getAllBlogCategories = async (req, res, next) => {
    try {
        const { search, status } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        if (status !== undefined) {
            query.isActive = status === 'true';
        }

        const categories = await BlogCategory.find(query).sort({ displayOrder: 1, createdAt: -1 });

        res.status(200).json(new ApiResponse(200, { categories }, 'Blog categories retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getBlogCategoryById = async (req, res, next) => {
    try {
        const category = await BlogCategory.findById(req.params.id);
        if (!category) {
            return next(new ApiError(404, 'Blog category not found'));
        }
        res.status(200).json(new ApiResponse(200, { category }, 'Blog category retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateBlogCategory = async (req, res, next) => {
    try {
        const category = await BlogCategory.findById(req.params.id);
        if (!category) {
            return next(new ApiError(404, 'Blog category not found'));
        }

        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            req.body.image = `${baseUrl}/uploads/${req.file.filename}`;
            
            const oldImage = category.image;
            if (oldImage && oldImage.includes('/uploads/')) {
                const oldFilename = oldImage.split('/uploads/')[1];
                const oldFilePath = path.join(__dirname, '../../../uploads', oldFilename);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
        }

        Object.assign(category, req.body);
        await category.save();
        res.status(200).json(new ApiResponse(200, { category }, 'Blog category updated successfully'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'Blog category slug already exists'));
        }
        next(error);
    }
};

exports.deleteBlogCategory = async (req, res, next) => {
    try {
        const category = await BlogCategory.findByIdAndDelete(req.params.id);
        if (!category) {
            return next(new ApiError(404, 'Blog category not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Blog category deleted successfully'));
    } catch (error) {
        next(error);
    }
};
