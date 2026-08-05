const Offer = require('../../models/offer.model');
const Product = require('../../models/product.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.createOffer = async (req, res, next) => {
    try {
        const { products } = req.body;
        
        // Validate products if provided
        if (products && products.length > 0) {
            const count = await Product.countDocuments({ _id: { $in: products } });
            if (count !== products.length) {
                return next(new ApiError(400, 'One or more provided product IDs are invalid'));
            }
        }

        const offer = await Offer.create(req.body);
        res.status(201).json(new ApiResponse(201, { offer }, 'Offer created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllOffers = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, status } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (status !== undefined) {
            query.isActive = status === 'true';
        }

        const skip = (page - 1) * limit;
        const offers = await Offer.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        // Dynamically compute a 'computedStatus' for Admin viewing
        const now = new Date();
        const mappedOffers = offers.map(offer => {
            let computedStatus = 'Upcoming';
            if (now > offer.endDate) {
                computedStatus = 'Expired';
            } else if (now >= offer.startDate && now <= offer.endDate) {
                computedStatus = 'Active';
            }
            if (!offer.isActive) {
                computedStatus = 'Inactive';
            }
            return {
                ...offer.toObject(),
                computedStatus
            };
        });

        const total = await Offer.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            offers: mappedOffers,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Offers retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getOfferById = async (req, res, next) => {
    try {
        const offer = await Offer.findById(req.params.id).populate('products', 'name sku slug images');
        if (!offer) {
            return next(new ApiError(404, 'Offer not found'));
        }
        res.status(200).json(new ApiResponse(200, { offer }, 'Offer retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateOffer = async (req, res, next) => {
    try {
        const { products } = req.body;
        
        // Validate products if provided
        if (products && products.length > 0) {
            const count = await Product.countDocuments({ _id: { $in: products } });
            if (count !== products.length) {
                return next(new ApiError(400, 'One or more provided product IDs are invalid'));
            }
        }

        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!offer) {
            return next(new ApiError(404, 'Offer not found'));
        }
        res.status(200).json(new ApiResponse(200, { offer }, 'Offer updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteOffer = async (req, res, next) => {
    try {
        const offer = await Offer.findByIdAndDelete(req.params.id);
        if (!offer) {
            return next(new ApiError(404, 'Offer not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Offer deleted successfully'));
    } catch (error) {
        next(error);
    }
};

exports.toggleOfferStatus = async (req, res, next) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) {
            return next(new ApiError(404, 'Offer not found'));
        }
        offer.isActive = !offer.isActive;
        await offer.save();
        res.status(200).json(new ApiResponse(200, { _id: offer._id, isActive: offer.isActive }, 'Offer status toggled successfully'));
    } catch (error) {
        next(error);
    }
};
