const NewsletterSubscriber = require('../../models/newsletter_subscriber.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.getSubscribers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const { status, search } = req.query;

        let query = {};
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        const subscribers = await NewsletterSubscriber.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        const total = await NewsletterSubscriber.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            subscribers,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, 'Subscribers retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getSubscriberById = async (req, res, next) => {
    try {
        const subscriber = await NewsletterSubscriber.findById(req.params.id);
        if (!subscriber) {
            throw new ApiError(404, 'Subscriber not found');
        }
        res.status(200).json(new ApiResponse(200, subscriber, 'Subscriber retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateSubscriberStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['active', 'unsubscribed'].includes(status)) {
            throw new ApiError(400, 'Invalid status');
        }

        const subscriber = await NewsletterSubscriber.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!subscriber) {
            throw new ApiError(404, 'Subscriber not found');
        }

        res.status(200).json(new ApiResponse(200, subscriber, 'Subscriber status updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteSubscriber = async (req, res, next) => {
    try {
        const subscriber = await NewsletterSubscriber.findByIdAndDelete(req.params.id);
        if (!subscriber) {
            throw new ApiError(404, 'Subscriber not found');
        }
        res.status(200).json(new ApiResponse(200, null, 'Subscriber deleted successfully'));
    } catch (error) {
        next(error);
    }
};
