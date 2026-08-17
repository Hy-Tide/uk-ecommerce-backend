const DeliveryZone = require('../../models/delivery_zone.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');
const { getCirclePolygon } = require('../../utils/geo.util');

exports.createDeliveryZone = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const data = { ...req.body };
        data.createdBy = req.user._id;
        data.updatedBy = req.user._id;

        // Process shape area
        if (data.shapeType === 'polygon') {
            data.area = {
                type: 'Polygon',
                coordinates: data.coordinates
            };
        } else if (data.shapeType === 'circle') {
            const [lng, lat] = data.center;
            const radius = data.radius;
            
            data.area = {
                type: 'Polygon',
                coordinates: getCirclePolygon(lng, lat, radius)
            };
            
            data.circleData = {
                center: data.center,
                radius: data.radius
            };
        }

        const deliveryZone = await DeliveryZone.create(data);
        res.status(201).json(new ApiResponse(201, { deliveryZone }, 'Delivery zone created successfully'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(409, 'Delivery zone with this name already exists'));
        }
        next(error);
    }
};

exports.getAllDeliveryZones = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, isActive } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const skip = (page - 1) * limit;

        const deliveryZones = await DeliveryZone.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
            
        const total = await DeliveryZone.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            deliveryZones,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Delivery zones retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getDeliveryZoneById = async (req, res, next) => {
    try {
        const deliveryZone = await DeliveryZone.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');
            
        if (!deliveryZone) {
            return next(new ApiError(404, 'Delivery zone not found'));
        }
        res.status(200).json(new ApiResponse(200, { deliveryZone }, 'Delivery zone retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateDeliveryZone = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const deliveryZone = await DeliveryZone.findById(req.params.id);
        if (!deliveryZone) {
            return next(new ApiError(404, 'Delivery zone not found'));
        }

        const data = { ...req.body };
        data.updatedBy = req.user._id;

        // Process shape area if shape properties are provided
        if (data.shapeType === 'polygon' && data.coordinates) {
            data.area = {
                type: 'Polygon',
                coordinates: data.coordinates
            };
            data.circleData = undefined; // clear circle data if switching type
        } else if (data.shapeType === 'circle' && data.center && data.radius) {
            const [lng, lat] = data.center;
            const radius = data.radius;
            
            data.area = {
                type: 'Polygon',
                coordinates: getCirclePolygon(lng, lat, radius)
            };
            
            data.circleData = {
                center: data.center,
                radius: data.radius
            };
        } else if (data.shapeType === 'circle' && deliveryZone.shapeType === 'circle') {
            // Partial update for circle
            const center = data.center || deliveryZone.circleData.center;
            const radius = data.radius || deliveryZone.circleData.radius;
            
            if (data.center || data.radius) {
                data.area = {
                    type: 'Polygon',
                    coordinates: getCirclePolygon(center[0], center[1], radius)
                };
                data.circleData = { center, radius };
            }
        }

        Object.assign(deliveryZone, data);
        await deliveryZone.save();

        res.status(200).json(new ApiResponse(200, { deliveryZone }, 'Delivery zone updated successfully'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(409, 'Delivery zone with this name already exists'));
        }
        next(error);
    }
};

exports.deleteDeliveryZone = async (req, res, next) => {
    try {
        const deliveryZone = await DeliveryZone.findByIdAndDelete(req.params.id);
        if (!deliveryZone) {
            return next(new ApiError(404, 'Delivery zone not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Delivery zone deleted successfully'));
    } catch (error) {
        next(error);
    }
};
