const Coupon = require('../../models/coupon.model');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAvailableCoupons = async (req, res, next) => {
    try {
        const currentDate = new Date();
        
        // Find coupons that are active, and either have no end date or end date is in the future
        const query = {
            isActive: true,
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gt: currentDate } }
            ]
        };

        const coupons = await Coupon.find(query)
            .select('code description discountType discountValue minPurchaseAmount maxDiscountAmount endDate usageLimit usedCount')
            .sort({ createdAt: -1 });

        const availableCoupons = coupons.filter(c => {
            if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) {
                return false;
            }
            return true;
        });

        res.status(200).json(new ApiResponse(200, { coupons: availableCoupons }, 'Available coupons retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
