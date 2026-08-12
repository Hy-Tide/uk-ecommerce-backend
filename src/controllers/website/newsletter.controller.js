const NewsletterSubscriber = require('../../models/newsletter_subscriber.model');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.subscribe = async (req, res, next) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            throw new ApiError(400, 'Email is required');
        }

        // Check if already subscribed
        let subscriber = await NewsletterSubscriber.findOne({ email });

        if (subscriber) {
            if (subscriber.status === 'unsubscribed') {
                // Re-subscribe
                subscriber.status = 'active';
                subscriber.name = name || subscriber.name;
                await subscriber.save();
                return res.status(200).json(new ApiResponse(200, subscriber, 'Successfully re-subscribed to the newsletter'));
            }
            return res.status(400).json(new ApiResponse(400, null, 'Email is already subscribed'));
        }

        subscriber = await NewsletterSubscriber.create({ email, name });
        res.status(201).json(new ApiResponse(201, subscriber, 'Successfully subscribed to the newsletter'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'Email is already subscribed'));
        }
        next(error);
    }
};
