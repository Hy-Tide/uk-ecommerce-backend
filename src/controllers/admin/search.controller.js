const SearchLog = require('../../models/search_log.model');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAnalytics = async (req, res, next) => {
    try {
        const totalSearches = await SearchLog.countDocuments();
        
        const zeroResultSearches = await SearchLog.countDocuments({ resultsCount: 0 });
        
        // Find distinct users who searched (excluding nulls)
        const uniqueUsers = await SearchLog.distinct('userId', { userId: { $ne: null } });

        res.status(200).json(new ApiResponse(200, {
            totalSearches,
            zeroResultSearches,
            uniqueUsersCount: uniqueUsers.length
        }, 'Search analytics retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getTopSearches = async (req, res, next) => {
    try {
        const { limit = 10 } = req.query;

        const topSearches = await SearchLog.aggregate([
            {
                $group: {
                    _id: '$query',
                    count: { $sum: 1 },
                    lastSearchedAt: { $max: '$createdAt' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: parseInt(limit)
            },
            {
                $project: {
                    _id: 0,
                    query: '$_id',
                    count: 1,
                    lastSearchedAt: 1
                }
            }
        ]);

        res.status(200).json(new ApiResponse(200, { topSearches }, 'Top searches retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
