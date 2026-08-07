const Notification = require('../../models/notification.model');
const User = require('../../models/user.model'); // Assuming the user model is named 'User'
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.sendNotification = async (req, res, next) => {
    try {
        const { title, message, type, userId } = req.body;

        if (!title || !message || !userId) {
            return next(new ApiError(400, 'Title, message, and userId are required'));
        }

        const notification = await Notification.create({
            title,
            message,
            type: type || 'General',
            userId,
            createdBy: req.user._id
        });

        res.status(201).json(new ApiResponse(201, { notification }, 'Notification sent successfully'));
    } catch (error) {
        next(error);
    }
};

exports.broadcastNotification = async (req, res, next) => {
    try {
        const { title, message, type } = req.body;

        if (!title || !message) {
            return next(new ApiError(400, 'Title and message are required'));
        }

        // Fetch all active users. 
        const users = await User.find({ is_active: true }, '_id');

        if (!users || users.length === 0) {
            return next(new ApiError(404, 'No active users found to broadcast to'));
        }

        const recipients = users.map(user => ({
            userId: user._id,
            status: 'sent',
            isRead: false
        }));

        const notification = await Notification.create({
            title,
            message,
            type: type || 'General',
            isBroadcast: true,
            recipients,
            deliveryStats: {
                total: users.length,
                sent: users.length,
                failed: 0
            },
            createdBy: req.user._id
        });

        res.status(201).json(new ApiResponse(201, { count: users.length, notificationId: notification._id }, 'Broadcast notification sent successfully to all active users'));
    } catch (error) {
        next(error);
    }
};

exports.getNotificationHistory = async (req, res, next) => {
    try {
        const { search, type, page = 1, limit = 20 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        if (type) {
            query.type = type;
        }

        const skip = (page - 1) * limit;

        const notifications = await Notification.find(query)
            .populate('userId', 'name email') // Optional: populate user details
            .populate('createdBy', 'name')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Notification.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            notifications,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Notification history retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
