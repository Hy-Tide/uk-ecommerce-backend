const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');
const Coupon = require('../../models/coupon.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

// Helper to recalculate cart totals
const recalculateCart = async (cart) => {
    let subTotal = 0;
    
    // Recalculate subtotal
    cart.items.forEach(item => {
        subTotal += item.price * item.quantity;
    });

    cart.subTotal = subTotal;
    cart.discountAmount = 0;

    // Check coupon
    if (cart.coupon) {
        const coupon = await Coupon.findById(cart.coupon);
        if (coupon && coupon.isActive && (!coupon.endDate || coupon.endDate > new Date())) {
            if (cart.subTotal >= coupon.minPurchaseAmount) {
                if (coupon.discountType === 'percentage') {
                    let discount = (cart.subTotal * coupon.discountValue) / 100;
                    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
                        discount = coupon.maxDiscountAmount;
                    }
                    cart.discountAmount = discount;
                } else if (coupon.discountType === 'fixed') {
                    cart.discountAmount = coupon.discountValue > cart.subTotal ? cart.subTotal : coupon.discountValue;
                }
            } else {
                // If subtotal drops below minimum, remove coupon automatically
                cart.coupon = null;
            }
        } else {
            // Invalid coupon
            cart.coupon = null;
        }
    }

    cart.totalAmount = cart.subTotal - cart.discountAmount;
    await cart.save();
    return cart;
};

exports.getCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id })
            .populate({
                path: 'items.product',
                select: 'name slug images inStock'
            })
            .populate('coupon', 'code discountType discountValue');

        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        } else {
            cart = await recalculateCart(cart);
            cart = await Cart.findOne({ user: req.user._id })
                .populate({
                    path: 'items.product',
                    select: 'name slug images inStock'
                })
                .populate('coupon', 'code discountType discountValue');
        }

        res.status(200).json(new ApiResponse(200, { cart }, 'Cart retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.addItemToCart = async (req, res, next) => {
    try {
        const { productId, variationId, quantity = 1 } = req.body;

        if (!productId) {
            return next(new ApiError(400, 'Product ID is required'));
        }

        const product = await Product.findById(productId);
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }

        let price = 0;

        if (product.variations && product.variations.length > 0) {
            if (!variationId) {
                return next(new ApiError(400, 'Variation ID is required for this product'));
            }
            const variation = product.variations.id(variationId);
            if (!variation) {
                return next(new ApiError(404, 'Variation not found'));
            }
            price = variation.salePrice > 0 ? variation.salePrice : variation.regularPrice;
            
            if (variation.stockQuantity < quantity) {
                return next(new ApiError(400, 'Not enough stock available'));
            }
        } else {
            // For backward compatibility or if there's a simple product scenario
            return next(new ApiError(400, 'Product must have variations'));
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId && 
            (variationId ? item.variationId?.toString() === variationId : true)
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                variationId: variationId || null,
                quantity,
                price
            });
        }

        await cart.save();
        cart = await recalculateCart(cart);
        
        cart = await Cart.findById(cart._id)
            .populate('items.product', 'name slug images')
            .populate('coupon', 'code discountType discountValue');

        res.status(200).json(new ApiResponse(200, { cart }, 'Item added to cart'));
    } catch (error) {
        next(error);
    }
};

exports.updateCartItemQuantity = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return next(new ApiError(400, 'Quantity must be at least 1'));
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return next(new ApiError(404, 'Cart not found'));

        const item = cart.items.id(itemId);
        if (!item) return next(new ApiError(404, 'Item not found in cart'));

        const product = await Product.findById(item.product);
        if (product) {
            const variation = product.variations.id(item.variationId);
            if (variation && variation.stockQuantity < quantity) {
                return next(new ApiError(400, 'Not enough stock available'));
            }
        }

        item.quantity = quantity;
        await cart.save();
        
        cart = await recalculateCart(cart);
        cart = await Cart.findById(cart._id)
            .populate('items.product', 'name slug images')
            .populate('coupon', 'code discountType discountValue');

        res.status(200).json(new ApiResponse(200, { cart }, 'Cart item quantity updated'));
    } catch (error) {
        next(error);
    }
};

exports.removeCartItem = async (req, res, next) => {
    try {
        const { itemId } = req.params;

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return next(new ApiError(404, 'Cart not found'));

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();
        
        cart = await recalculateCart(cart);
        cart = await Cart.findById(cart._id)
            .populate('items.product', 'name slug images')
            .populate('coupon', 'code discountType discountValue');

        res.status(200).json(new ApiResponse(200, { cart }, 'Item removed from cart'));
    } catch (error) {
        next(error);
    }
};

exports.clearCart = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return next(new ApiError(404, 'Cart not found'));

        cart.items = [];
        cart.coupon = null;
        await cart.save();
        
        cart = await recalculateCart(cart);

        res.status(200).json(new ApiResponse(200, { cart }, 'Cart cleared successfully'));
    } catch (error) {
        next(error);
    }
};

exports.applyCoupon = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) return next(new ApiError(400, 'Coupon code is required'));

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
        if (!coupon) return next(new ApiError(404, 'Invalid coupon code'));

        if (coupon.endDate && coupon.endDate < new Date()) {
            return next(new ApiError(400, 'Coupon has expired'));
        }

        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return next(new ApiError(400, 'Coupon usage limit reached'));
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart || cart.items.length === 0) {
            return next(new ApiError(400, 'Cart is empty'));
        }

        if (cart.subTotal < coupon.minPurchaseAmount) {
            return next(new ApiError(400, `Minimum purchase amount of £${coupon.minPurchaseAmount} is required for this coupon`));
        }

        cart.coupon = coupon._id;
        await cart.save();
        
        cart = await recalculateCart(cart);
        cart = await Cart.findById(cart._id)
            .populate('items.product', 'name slug images')
            .populate('coupon', 'code discountType discountValue');

        res.status(200).json(new ApiResponse(200, { cart }, 'Coupon applied successfully'));
    } catch (error) {
        next(error);
    }
};

exports.removeCoupon = async (req, res, next) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return next(new ApiError(404, 'Cart not found'));

        cart.coupon = null;
        await cart.save();
        
        cart = await recalculateCart(cart);
        cart = await Cart.findById(cart._id)
            .populate('items.product', 'name slug images');

        res.status(200).json(new ApiResponse(200, { cart }, 'Coupon removed successfully'));
    } catch (error) {
        next(error);
    }
};
