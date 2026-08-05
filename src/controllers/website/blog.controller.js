const Blog = require('../../models/blog.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getBlogs = async (req, res, next) => {
    try {
        const { search, categoryId, tag, page = 1, limit = 10 } = req.query;
        let query = { isActive: true };

        // Ensure we only show published blogs (if publishedAt is set, it must be in the past)
        // If you only want blogs that have a publishedAt, add that constraint. 
        // For now, if publishedAt exists, we check it.
        query.$or = [
            { publishedAt: { $lte: new Date() } },
            { publishedAt: { $exists: false } },
            { publishedAt: null }
        ];

        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { summary: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } }
                ]
            });
        }

        if (categoryId) {
            query.categoryId = categoryId;
        }

        if (tag) {
            query.tags = { $regex: tag, $options: 'i' };
        }

        const skip = (page - 1) * limit;

        const blogs = await Blog.find(query)
            .populate('categoryId', 'name slug')
            .populate('author', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ isFeatured: -1, displayOrder: 1, publishedAt: -1, createdAt: -1 });

        const total = await Blog.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            blogs,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Blogs retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getBlogDetails = async (req, res, next) => {
    try {
        const blog = await Blog.findOneAndUpdate(
            { slug: req.params.slug, isActive: true },
            { $inc: { views: 1 } },
            { new: true }
        )
        .populate('categoryId', 'name slug')
        .populate('author', 'name');

        if (!blog) {
            return next(new ApiError(404, 'Blog not found'));
        }

        res.status(200).json(new ApiResponse(200, { blog }, 'Blog retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getRelatedBlogs = async (req, res, next) => {
    try {
        const currentBlog = await Blog.findOne({ slug: req.params.slug, isActive: true });
        if (!currentBlog) {
            return next(new ApiError(404, 'Blog not found'));
        }

        let relatedBlogs = await Blog.find({
            _id: { $ne: currentBlog._id },
            isActive: true,
            $or: [
                { categoryId: currentBlog.categoryId },
                { tags: { $in: currentBlog.tags } }
            ]
        })
        .populate('categoryId', 'name slug')
        .sort({ publishedAt: -1, createdAt: -1 })
        .limit(4);

        // Fallback to latest active blogs if none found
        if (relatedBlogs.length === 0) {
            relatedBlogs = await Blog.find({
                _id: { $ne: currentBlog._id },
                isActive: true
            })
            .populate('categoryId', 'name slug')
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(4);
        }

        res.status(200).json(new ApiResponse(200, { relatedBlogs }, 'Related blogs retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
