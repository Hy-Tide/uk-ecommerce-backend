const Setting = require('../../models/setting.model');
const ApiResponse = require('../../utils/ApiResponse');

exports.getSettings = async (req, res, next) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) {
            setting = {};
        }

        const data = {
            storeName: setting.storeName,
            address: setting.address,
            contactEmail: setting.contactEmail,
            supportEmail: setting.supportEmail,
            phone: setting.phone,
            whatsappNumber: setting.whatsappNumber,
            socialMedia: setting.socialMedia,
            currency: setting.currency,
            taxPercentage: setting.taxPercentage,
            deliveryCharge: setting.deliveryCharge,
            minimumOrderAmount: setting.minimumOrderAmount,
            freeDeliveryAmount: setting.freeDeliveryAmount,
            logoUrl: setting.logoUrl,
            faviconUrl: setting.faviconUrl
        };

        res.status(200).json(new ApiResponse(200, data, 'Settings retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
