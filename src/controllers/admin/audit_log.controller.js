const AuditLog = require('../../models/audit_log.model');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAuditLogs = async (req, res, next) => {
    try {
        const { action, adminId, entityType, startDate, endDate, limit = 50, page = 1 } = req.query;

        const match = {};
        if (action) match.action = action;
        if (adminId) match.adminId = adminId;
        if (entityType) match.entityType = entityType;
        
        if (startDate || endDate) {
            match.createdAt = {};
            if (startDate) match.createdAt.$gte = new Date(startDate);
            if (endDate) match.createdAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const logs = await AuditLog.find(match)
            .populate('adminId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(match);

        res.status(200).json(new ApiResponse(200, {
            logs,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit))
            }
        }, 'Audit logs retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
