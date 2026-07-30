const Order = require('../../models/order.model');
const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(new ApiResponse(200, { orders }, 'Orders retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getOrderDetails = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
            .populate('items.product', 'name slug images')
            .populate('coupon', 'code discountType discountValue');

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        res.status(200).json(new ApiResponse(200, { order }, 'Order details retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Confirmed') {
            return next(new ApiError(400, `Cannot cancel order that is already ${order.orderStatus}`));
        }

        order.orderStatus = 'Cancelled';
        await order.save();

        // Optionally, refund stock here depending on business logic
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                const variation = product.variations.id(item.variationId);
                if (variation) {
                    variation.stockQuantity += item.quantity;
                    await product.save();
                }
            }
        }

        res.status(200).json(new ApiResponse(200, { order }, 'Order cancelled successfully'));
    } catch (error) {
        next(error);
    }
};

exports.reorder = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Add items to cart if stock exists
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (!product) continue;
            
            const variation = product.variations.id(item.variationId);
            if (!variation) continue;

            if (variation.stockQuantity >= item.quantity) {
                const existingItemIndex = cart.items.findIndex(cartItem => 
                    cartItem.product.toString() === item.product.toString() && 
                    cartItem.variationId?.toString() === item.variationId.toString()
                );

                if (existingItemIndex > -1) {
                    cart.items[existingItemIndex].quantity += item.quantity;
                } else {
                    cart.items.push({
                        product: item.product,
                        variationId: item.variationId,
                        quantity: item.quantity,
                        price: variation.salePrice > 0 ? variation.salePrice : variation.regularPrice
                    });
                }
            }
        }

        await cart.save();
        // Since we don't have recalculateCart here, the checkout/validate endpoint will recalculate it later,
        // or we could recalculate it. Let's just return a success message telling them to go to cart.
        
        res.status(200).json(new ApiResponse(200, null, 'Items added to cart for reorder'));
    } catch (error) {
        next(error);
    }
};

exports.getInvoice = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
            .populate('items.product', 'name slug sku images');

        if (!order) {
            return next(new ApiError(404, 'Order not found'));
        }

        // Here you would typically generate a PDF or return structured JSON for the frontend to render an invoice
        res.status(200).json(new ApiResponse(200, { 
            invoice: {
                orderNumber: order.orderNumber,
                date: order.createdAt,
                status: order.orderStatus,
                customerName: req.user.name,
                customerEmail: req.user.email,
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
