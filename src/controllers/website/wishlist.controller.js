const Wishlist = require('../../models/wishlist.model');
const Product = require('../../models/product.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getWishlist = async (req, res, next) => {
    try {
        let wishlist = await Wishlist.findOne({ user_id: req.user._id }).populate('products');
        
        if (!wishlist) {
            wishlist = await Wishlist.create({ user_id: req.user._id, products: [] });
        }

        res.status(200).json(new ApiResponse(200, { wishlist }, 'Wishlist retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.addToWishlist = async (req, res, next) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return next(new ApiError(400, 'Product ID is required'));
        }

        const product = await Product.findById(productId);
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }

        let wishlist = await Wishlist.findOne({ user_id: req.user._id });

        if (!wishlist) {
            wishlist = await Wishlist.create({ user_id: req.user._id, products: [productId] });
        } else {
            if (!wishlist.products.includes(productId)) {
                wishlist.products.push(productId);
                await wishlist.save();
            }
        }

        wishlist = await wishlist.populate('products');

        res.status(200).json(new ApiResponse(200, { wishlist }, 'Product added to wishlist'));
    } catch (error) {
        next(error);
    }
};

exports.removeFromWishlist = async (req, res, next) => {
    try {
        const { productId } = req.params;

        let wishlist = await Wishlist.findOne({ user_id: req.user._id });

        if (!wishlist) {
            return next(new ApiError(404, 'Wishlist not found'));
        }

        wishlist.products = wishlist.products.filter(id => id.toString() !== productId.toString());
        await wishlist.save();

        wishlist = await wishlist.populate('products');

        res.status(200).json(new ApiResponse(200, { wishlist }, 'Product removed from wishlist'));
    } catch (error) {
        next(error);
    }
};
