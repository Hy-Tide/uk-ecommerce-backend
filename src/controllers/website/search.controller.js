const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const Brand = require('../../models/brand.model');
const SearchLog = require('../../models/search_log.model');
const ApiResponse = require('../../utils/ApiResponse');

exports.getSuggestions = async (req, res, next) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 2) {
            return res.status(200).json(new ApiResponse(200, {
                products: [],
                categories: [],
                brands: []
            }, 'Search query too short'));
        }

        const regex = new RegExp(q, 'i');

        // Parallel execution for faster search
        const [products, categories, brands] = await Promise.all([
            Product.find({
                status: 'active',
                $or: [
                    { name: regex },
                    { tags: regex }
                ]
            }).select('name slug images variations').limit(3).lean(),

            Category.find({
                status: 'Active',
                name: regex
            }).select('name slug image').limit(3).lean(),

            Brand.find({
                is_active: true,
                name: regex
            }).select('name slug image_url').limit(3).lean()
        ]);

        res.status(200).json(new ApiResponse(200, {
            products,
            categories,
            brands
        }, 'Suggestions retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.logSearch = async (req, res, next) => {
    try {
        const { query, resultsCount } = req.body;

        if (!query) {
            return res.status(400).json(new ApiResponse(400, null, 'Search query is required'));
        }

        // We only save to DB, no need to return the saved doc to frontend
        await SearchLog.create({
            query,
            userId: req.user ? req.user._id : null,
            resultsCount: resultsCount || 0
        });

        res.status(201).json(new ApiResponse(201, null, 'Search logged successfully'));
    } catch (error) {
        next(error);
    }
};
