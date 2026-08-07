const Notification = require('../../models/notification.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getMyNotifications = async (req, res, next) => {
    try {
        const { isRead, page = 1, limit = 20 } = req.query;
        let query = { 
            $or: [
                { userId: req.user._id, isBroadcast: false },
                { isBroadcast: true, 'recipients.userId': req.user._id }
            ]
        };

        if (isRead !== undefined) {
            const isReadBool = isRead === 'true';
            query = {
                $or: [
                    { userId: req.user._id, isBroadcast: false, isRead: isReadBool },
                    { isBroadcast: true, recipients: { $elemMatch: { userId: req.user._id, isRead: isReadBool } } }
                ]
            };
        }

        const skip = (page - 1) * limit;

        const notifications = await Notification.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            $or: [
                { userId: req.user._id, isBroadcast: false, isRead: false },
                { isBroadcast: true, recipients: { $elemMatch: { userId: req.user._id, isRead: false } } }
            ]
        });

        res.status(200).json(new ApiResponse(200, {
            notifications,
            unreadCount,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Notifications retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.markAsRead = async (req, res, next) => {
    try {
        let notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id, isBroadcast: false },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            notification = await Notification.findOneAndUpdate(
                { _id: req.params.id, isBroadcast: true, 'recipients.userId': req.user._id },
                { $set: { 'recipients.$.isRead': true } },
                { new: true }
            );
        }

        if (!notification) {
            return next(new ApiError(404, 'Notification not found'));
        }

        res.status(200).json(new ApiResponse(200, { notification }, 'Notification marked as read'));
    } catch (error) {
        next(error);
    }
};

exports.markAllAsRead = async (req, res, next) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isBroadcast: false, isRead: false },
            { isRead: true }
        );
        
        await Notification.updateMany(
            { isBroadcast: true, 'recipients.userId': req.user._id },
            { $set: { 'recipients.$[elem].isRead': true } },
            { arrayFilters: [{ 'elem.userId': req.user._id, 'elem.isRead': false }] }
        );

        res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
    } catch (error) {
        next(error);
    }
};
