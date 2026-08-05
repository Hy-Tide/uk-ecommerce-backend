const Blog = require('../../models/blog.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.createBlog = async (req, res, next) => {
    try {
        req.body.author = req.user._id; // Attach current admin as author
        const blog = await Blog.create(req.body);
        res.status(201).json(new ApiResponse(201, { blog }, 'Blog created successfully'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'Blog slug already exists'));
        }
        next(error);
    }
};

exports.getAllBlogs = async (req, res, next) => {
    try {
        const { search, categoryId, status, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (categoryId) {
            query.categoryId = categoryId;
        }

        if (status !== undefined) {
            query.isActive = status === 'true';
        }

        const skip = (page - 1) * limit;
        const blogs = await Blog.find(query)
            .populate('categoryId', 'name slug')
            .populate('author', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ publishedAt: -1, createdAt: -1 });

        const total = await Blog.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            blogs,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Blogs retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getBlogById = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('categoryId', 'name slug')
            .populate('author', 'name email');
            
        if (!blog) {
            return next(new ApiError(404, 'Blog not found'));
        }
        res.status(200).json(new ApiResponse(200, { blog }, 'Blog retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!blog) {
            return next(new ApiError(404, 'Blog not found'));
        }
        res.status(200).json(new ApiResponse(200, { blog }, 'Blog updated successfully'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'Blog slug already exists'));
        }
        next(error);
    }
};

exports.deleteBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return next(new ApiError(404, 'Blog not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Blog deleted successfully'));
    } catch (error) {
        next(error);
    }
};
