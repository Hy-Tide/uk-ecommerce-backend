const Offer = require('../../models/offer.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getOffers = async (req, res, next) => {
    try {
        const now = new Date();
        
        const offers = await Offer.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).sort({ createdAt: -1 });

        res.status(200).json(new ApiResponse(200, { offers }, 'Offers retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getOfferProducts = async (req, res, next) => {
    try {
        const now = new Date();
        
        // Find offer and ensure it's active and within date range
        const offer = await Offer.findOne({
            _id: req.params.id,
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).populate({
            path: 'products',
            match: { status: 'active' }, // Only populate active products
            populate: [
                { path: 'categoryId', select: 'name slug image icon' },
                { path: 'brand', select: 'name slug' }
            ]
        });

        if (!offer) {
            return next(new ApiError(404, 'Offer not found or has expired'));
        }

        // Ideally, we could use a product mapper here. For now, returning populated products directly.
        res.status(200).json(new ApiResponse(200, { 
            offer: {
                _id: offer._id,
                title: offer.title,
                description: offer.description,
                discountType: offer.discountType,
                discountValue: offer.discountValue,
                bannerImage: offer.bannerImage
            },
            products: offer.products 
        }, 'Offer products retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
