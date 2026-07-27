const Order = require('../../models/order.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAllOrders = async (req, res, next) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.orderNumber = { $regex: search, $options: 'i' };
        }
        if (status) {
            query.orderStatus = status;
        }

        const skip = (page - 1) * limit;

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });
            
        const total = await Order.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            orders,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Orders retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getOrderDetails = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('shippingAddress')
            .populate('billingAddress')
            .populate('items.product', 'name slug sku images')
            .populate('coupon', 'code discountType discountValue')
            .populate('deliveryPersonId', 'name email');

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        res.status(200).json(new ApiResponse(200, { order }, 'Order details retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus } = req.body;
        const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Ready For Delivery', 'Delivered', 'Cancelled'];

        if (!validStatuses.includes(orderStatus)) {
            return next(new ApiError(400, 'Invalid order status'));
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        order.orderStatus = orderStatus;
        if (orderStatus === 'Delivered') {
            order.paymentStatus = 'completed'; // Assuming delivery means paid for COD
        }

        await order.save();

        res.status(200).json(new ApiResponse(200, { order }, 'Order status updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.assignDeliveryPerson = async (req, res, next) => {
    try {
        const { deliveryPersonId } = req.body;

        if (!deliveryPersonId) {
            return next(new ApiError(400, 'Delivery Person ID is required'));
        }

        const order = await Order.findById(req.params.id);
        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        order.deliveryPersonId = deliveryPersonId;
        await order.save();

        res.status(200).json(new ApiResponse(200, { order }, 'Delivery person assigned successfully'));
    } catch (error) {
        next(error);
    }
};

exports.printInvoice = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('shippingAddress')
            .populate('billingAddress')
            .populate('items.product', 'name slug sku images');

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        res.status(200).json(new ApiResponse(200, { 
            invoice: {
                orderNumber: order.orderNumber,
                date: order.createdAt,
                status: order.orderStatus,
                customer: order.user,
                shippingAddress: order.shippingAddress,
                billingAddress: order.billingAddress,
                items: order.items,
                subTotal: order.subTotal,
                discount: order.discountAmount,
                shippingFee: order.shippingFee,
                total: order.totalAmount
            } 
        }, 'Invoice retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
