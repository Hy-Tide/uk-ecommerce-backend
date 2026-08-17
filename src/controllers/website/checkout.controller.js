const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');
const Coupon = require('../../models/coupon.model');
const Order = require('../../models/order.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { logStockChange } = require('../../utils/stockLogger');

exports.validateCheckout = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').populate('coupon');

        if (!cart || cart.items.length === 0) {
            return next(new ApiError(400, 'Cart is empty'));
        }

        const errors = [];

        for (const item of cart.items) {
            if (!item.product) {
                errors.push('A product in your cart is no longer available.');
                continue;
            }
            
            const product = await Product.findById(item.product._id || item.product);
            if (!product) {
                errors.push(`Product ${item.product.name || item.product} not found.`);
                continue;
            }

            if (product.variations && product.variations.length > 0) {
                const variation = item.variationId ? product.variations.id(item.variationId) : null;
                if (!variation) {
                    errors.push(`Variation for product ${product.name} not found.`);
                } else if (variation.stockQuantity < item.quantity) {
                    errors.push(`Not enough stock for ${product.name} (Requested: ${item.quantity}, Available: ${variation.stockQuantity}).`);
                }
            } else {
                errors.push(`Product ${product.name} has invalid configuration (no variations).`);
            }
        }

        if (cart.coupon) {
            const coupon = await Coupon.findById(cart.coupon._id);
            if (!coupon || !coupon.isActive) {
                errors.push('Applied coupon is no longer active.');
            } else if (coupon.endDate && coupon.endDate < new Date()) {
                errors.push('Applied coupon has expired.');
            } else if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
                errors.push('Applied coupon usage limit reached.');
            } else if (cart.subTotal < coupon.minPurchaseAmount) {
                errors.push(`Cart subtotal does not meet minimum purchase amount for coupon.`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Checkout validation failed',
                errors
            });
        }

        res.status(200).json(new ApiResponse(200, { cart }, 'Checkout validated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getPaymentMethods = async (req, res, next) => {
    try {
        const methods = [
            { id: 'stripe', name: 'Credit / Debit Card (Stripe)' }
        ];
        res.status(200).json(new ApiResponse(200, { paymentMethods: methods }, 'Payment methods retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.placeOrder = async (req, res, next) => {
    try {
        const { shippingAddress, billingAddress, paymentMethod, deliveryNotes, deliverySlot } = req.body;

        if (!shippingAddress) return next(new ApiError(400, 'Shipping address is required'));
        if (!paymentMethod) return next(new ApiError(400, 'Payment method is required'));

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return next(new ApiError(400, 'Cart is empty'));
        }

        // Validate stock and prepare order items
        const orderItems = [];
        for (const item of cart.items) {
            const product = await Product.findById(item.product._id);
            if (!product) return next(new ApiError(404, `Product ${item.product._id} not found`));

            const variation = product.variations.id(item.variationId);
            if (!variation || variation.stockQuantity < item.quantity) {
                return next(new ApiError(400, `Not enough stock for ${product.name}`));
            }

            const previousStock = variation.stockQuantity;

            // Deduct stock
            variation.stockQuantity -= item.quantity;
            await product.save();
            
            await logStockChange({
                productId: product._id,
                variationId: variation._id,
                action: 'STOCK_REMOVED',
                quantityChanged: item.quantity,
                previousStock,
                newStock: variation.stockQuantity,
                reason: 'Checkout Order',
                user: req.user ? req.user._id : null,
                userModel: 'User'
            });

            orderItems.push({
                product: product._id,
                variationId: variation._id,
                name: product.name,
                price: item.price,
                quantity: item.quantity
            });
        }

        if (cart.coupon) {
            const coupon = await Coupon.findById(cart.coupon);
            if (coupon) {
                coupon.usedCount += 1;
                await coupon.save();
            }
        }

        // Generate simple order number
        const orderNumber = 'ORD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

        const order = await Order.create({
            orderNumber,
            user: req.user._id,
            items: orderItems,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            deliveryNotes,
            deliverySlot,
            coupon: cart.coupon,
            subTotal: cart.subTotal,
            discountAmount: cart.discountAmount,
            shippingFee: 0, // Placeholder
            totalAmount: cart.totalAmount,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed', // Simplified
            orderStatus: 'Pending'
        });

        // Clear cart
        cart.items = [];
        cart.coupon = null;
        cart.subTotal = 0;
        cart.discountAmount = 0;
        cart.totalAmount = 0;
        await cart.save();

        res.status(201).json(new ApiResponse(201, { order }, 'Order placed successfully'));
    } catch (error) {
        next(error);
    }
};
