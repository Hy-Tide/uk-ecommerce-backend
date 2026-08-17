const deliveryService = require('../../services/delivery.service');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.checkAvailability = async (req, res, next) => {
    try {
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return next(new ApiError(400, 'Latitude and longitude are required'));
        }

        const result = await deliveryService.checkDeliveryAvailability(latitude, longitude);

        res.status(200).json(new ApiResponse(200, result, 'Delivery availability checked'));
    } catch (error) {
        next(error);
    }
};
