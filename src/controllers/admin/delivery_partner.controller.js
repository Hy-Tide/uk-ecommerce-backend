const DeliveryPartner = require('../../models/delivery_partner.model');
const DeliveryAssignment = require('../../models/delivery_assignment.model');
const DeliveryHistory = require('../../models/delivery_history.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');
const { processBase64Images } = require('../../utils/base64Helper');

exports.createPartner = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const data = { ...req.body };
        data.createdBy = req.user._id;
        data.updatedBy = req.user._id;

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        if (data.profileImage) {
            data.profileImage = await processBase64Images(data.profileImage, baseUrl);
        }

        const partner = await DeliveryPartner.create(data);
        res.status(201).json(new ApiResponse(201, { partner }, 'Delivery partner created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllPartners = async (req, res, next) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) query.status = status;

        const skip = (page - 1) * limit;
        const total = await DeliveryPartner.countDocuments(query);
        const partners = await DeliveryPartner.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.status(200).json(new ApiResponse(200, { 
            partners,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Delivery partners retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAvailablePartners = async (req, res, next) => {
    try {
        const partners = await DeliveryPartner.find({ isActive: true, status: 'AVAILABLE' });
        res.status(200).json(new ApiResponse(200, { partners }, 'Available delivery partners retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getPartnerById = async (req, res, next) => {
    try {
        const partner = await DeliveryPartner.findById(req.params.id);
        if (!partner) return next(new ApiError(404, 'Delivery partner not found'));

        res.status(200).json(new ApiResponse(200, { partner }, 'Delivery partner retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updatePartner = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const partner = await DeliveryPartner.findById(req.params.id);
        if (!partner) return next(new ApiError(404, 'Delivery partner not found'));

        const data = { ...req.body };
        data.updatedBy = req.user._id;

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        if (data.profileImage) {
            data.profileImage = await processBase64Images(data.profileImage, baseUrl);
        }

        Object.assign(partner, data);
        await partner.save();

        res.status(200).json(new ApiResponse(200, { partner }, 'Delivery partner updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deletePartner = async (req, res, next) => {
    try {
        const partner = await DeliveryPartner.findByIdAndDelete(req.params.id);
        if (!partner) return next(new ApiError(404, 'Delivery partner not found'));

        res.status(200).json(new ApiResponse(200, null, 'Delivery partner deleted successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getPartnerAssignments = async (req, res, next) => {
    try {
        const assignments = await DeliveryAssignment.find({ deliveryPartnerId: req.params.id, isCurrent: true, deliveryStatus: { $ne: 'DELIVERED' } })
            .populate('orderId')
            .sort({ createdAt: -1 });

        res.status(200).json(new ApiResponse(200, { assignments }, 'Partner active assignments retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getPartnerHistory = async (req, res, next) => {
    try {
        const history = await DeliveryHistory.find({ deliveryPartnerId: req.params.id })
            .populate('orderId')
            .populate('performedBy', 'name email')
            .sort({ timestamp: -1 });

        res.status(200).json(new ApiResponse(200, { history }, 'Partner delivery history retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
