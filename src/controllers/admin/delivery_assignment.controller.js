const DeliveryAssignment = require('../../models/delivery_assignment.model');
const DeliveryPartner = require('../../models/delivery_partner.model');
const DeliveryHistory = require('../../models/delivery_history.model');
const Order = require('../../models/order.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Helper to check and update partner availability
const updatePartnerAvailability = async (partnerId) => {
    const activeDeliveriesCount = await DeliveryAssignment.countDocuments({
        deliveryPartnerId: partnerId,
        isCurrent: true,
        deliveryStatus: { $nin: ['DELIVERED', 'FAILED', 'CANCELLED'] }
    });

    const partner = await DeliveryPartner.findById(partnerId);
    if (partner) {
        if (activeDeliveriesCount === 0 && partner.status === 'ON_DELIVERY') {
            partner.status = 'AVAILABLE';
            await partner.save();
        } else if (activeDeliveriesCount > 0 && partner.status === 'AVAILABLE') {
            partner.status = 'ON_DELIVERY';
            await partner.save();
        }
    }
};

exports.assignOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const { orderId, deliveryPartnerId, notes } = req.body;
        const adminId = req.user._id;

        let queryOrderId = orderId;
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            const orderObj = await Order.findOne({ orderNumber: orderId });
            if (!orderObj) return next(new ApiError(404, 'Order not found'));
            queryOrderId = orderObj._id;
        }

        const order = await Order.findById(queryOrderId);
        if (!order) return next(new ApiError(404, 'Order not found'));
        if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
            return next(new ApiError(400, `Cannot assign delivery for ${order.orderStatus} order`));
        }
        if (order.activeDeliveryAssignment) {
            return next(new ApiError(400, 'Order is already assigned. Please use reassign API.'));
        }

        const partner = await DeliveryPartner.findById(deliveryPartnerId);
        if (!partner) return next(new ApiError(404, 'Delivery partner not found'));
        if (!partner.isActive) return next(new ApiError(400, 'Delivery partner is inactive'));

        // Create Assignment
        const assignment = await DeliveryAssignment.create({
            orderId: queryOrderId,
            deliveryPartnerId,
            assignedBy: adminId,
            deliveryNotes: notes,
            deliveryStatus: 'ASSIGNED'
        });

        // Update Order
        order.activeDeliveryAssignment = assignment._id;
        order.deliveryStatus = 'ASSIGNED';
        await order.save();

        // Create History
        await DeliveryHistory.create({
            orderId,
            deliveryPartnerId,
            action: 'ASSIGNED',
            performedBy: adminId,
            notes: notes
        });

        // Update partner availability
        await updatePartnerAvailability(deliveryPartnerId);

        res.status(200).json(new ApiResponse(200, { assignment }, 'Order assigned successfully'));
    } catch (error) {
        next(error);
    }
};

exports.reassignOrder = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const { orderId, deliveryPartnerId, notes } = req.body;
        const adminId = req.user._id;

        let queryOrderId = orderId;
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            const orderObj = await Order.findOne({ orderNumber: orderId });
            if (!orderObj) return next(new ApiError(404, 'Order not found'));
            queryOrderId = orderObj._id;
        }

        const order = await Order.findById(queryOrderId);
        if (!order) return next(new ApiError(404, 'Order not found'));

        const newPartner = await DeliveryPartner.findById(deliveryPartnerId);
        if (!newPartner || !newPartner.isActive) {
            return next(new ApiError(400, 'Invalid or inactive new delivery partner'));
        }

        const oldAssignment = await DeliveryAssignment.findOne({ orderId, isCurrent: true });
        let oldPartnerId = null;

        if (oldAssignment) {
            oldPartnerId = oldAssignment.deliveryPartnerId;
            if (oldPartnerId.toString() === deliveryPartnerId) {
                return next(new ApiError(400, 'Order is already assigned to this partner'));
            }
            // Invalidate old assignment
            oldAssignment.isCurrent = false;
            oldAssignment.deliveryStatus = 'CANCELLED'; // The assignment is cancelled
            await oldAssignment.save();

            await DeliveryHistory.create({
                orderId,
                deliveryPartnerId: oldPartnerId,
                action: 'REASSIGNED_FROM',
                performedBy: adminId,
                notes: 'Reassigned to another partner'
            });
        }

        // Create new assignment
        const newAssignment = await DeliveryAssignment.create({
            orderId: queryOrderId,
            deliveryPartnerId,
            assignedBy: adminId,
            deliveryNotes: notes,
            deliveryStatus: 'REASSIGNED'
        });

        // Update Order
        order.activeDeliveryAssignment = newAssignment._id;
        order.deliveryStatus = 'ASSIGNED';
        await order.save();

        await DeliveryHistory.create({
            orderId,
            deliveryPartnerId,
            action: 'REASSIGNED_TO',
            performedBy: adminId,
            notes: notes
        });

        if (oldPartnerId) await updatePartnerAvailability(oldPartnerId);
        await updatePartnerAvailability(deliveryPartnerId);

        res.status(200).json(new ApiResponse(200, { assignment: newAssignment }, 'Order reassigned successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateDeliveryStatus = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const { id } = req.params; // assignment ID or order ID
        const { status, notes } = req.body;
        const adminId = req.user._id;

        let assignment = null;
        
        // 1. Try treating it as an Assignment ID (ObjectId)
        if (mongoose.Types.ObjectId.isValid(id)) {
            assignment = await DeliveryAssignment.findById(id);
        }
        
        // 2. If not found, try treating it as an Order ID
        if (!assignment) {
            let orderQueryId = id;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                const orderObj = await Order.findOne({ orderNumber: id });
                if (orderObj) orderQueryId = orderObj._id;
            }
            if (mongoose.Types.ObjectId.isValid(orderQueryId)) {
                assignment = await DeliveryAssignment.findOne({ orderId: orderQueryId, isCurrent: true });
            }
        }

        if (!assignment) return next(new ApiError(404, 'Delivery assignment not found'));
        if (!assignment.isCurrent) return next(new ApiError(400, 'Cannot update a past assignment'));

        // Status transition validation logic can be added here if needed
        // E.g., DELIVERED cannot go back to PICKED_UP
        const finalStatuses = ['DELIVERED', 'FAILED', 'CANCELLED'];
        if (finalStatuses.includes(assignment.deliveryStatus)) {
            return next(new ApiError(400, `Assignment is already in final status: ${assignment.deliveryStatus}`));
        }

        assignment.deliveryStatus = status;
        
        // Update timestamp based on status
        if (status === 'ACCEPTED') assignment.acceptedAt = new Date();
        if (status === 'PICKED_UP') assignment.pickedUpAt = new Date();
        if (status === 'OUT_FOR_DELIVERY') assignment.outForDeliveryAt = new Date();
        if (status === 'DELIVERED') assignment.deliveredAt = new Date();
        
        await assignment.save();

        const order = await Order.findById(assignment.orderId);
        if (order) {
            order.deliveryStatus = status;
            // Update overall orderStatus based on delivery to sync with Orders module
            if (status === 'DELIVERED') order.orderStatus = 'Delivered';
            if (status === 'OUT_FOR_DELIVERY') order.orderStatus = 'Ready For Delivery';
            if (status === 'PICKED_UP') order.orderStatus = 'Ready For Delivery';
            if (status === 'ACCEPTED') order.orderStatus = 'Ready For Delivery';
            await order.save();
        }

        await DeliveryHistory.create({
            orderId: assignment.orderId,
            deliveryPartnerId: assignment.deliveryPartnerId,
            action: status,
            performedBy: adminId,
            notes: notes
        });

        await updatePartnerAvailability(assignment.deliveryPartnerId);

        res.status(200).json(new ApiResponse(200, { assignment }, 'Delivery status updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAssignmentHistory = async (req, res, next) => {
    try {
        const { orderId } = req.params;
        let queryOrderId = orderId;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            const order = await Order.findOne({ orderNumber: orderId });
            if (!order) {
                return res.status(404).json(new ApiResponse(404, null, 'Order not found'));
            }
            queryOrderId = order._id;
        }

        const history = await DeliveryHistory.find({ orderId: queryOrderId })
            .populate('deliveryPartnerId', 'name phone')
            .populate('performedBy', 'name email')
            .sort({ timestamp: -1 });

        res.status(200).json(new ApiResponse(200, { history }, 'Order delivery history retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
