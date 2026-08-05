const Setting = require('../../models/setting.model');
const ApiResponse = require('../../utils/ApiResponse');
const { logAdminAction } = require('../../utils/audit.util');

exports.getSettings = async (req, res, next) => {
    try {
        let settings = await Setting.findOne();
        
        // If no settings exist yet, create default settings
        if (!settings) {
            settings = await Setting.create({});
        }
        
        res.status(200).json(new ApiResponse(200, { settings }, 'Settings retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateSettings = async (req, res, next) => {
    try {
        let settings = await Setting.findOne();
        
        if (!settings) {
            settings = await Setting.create(req.body);
        } else {
            // Update the existing document
            const updatableFields = [
                'storeName', 'address', 'contactEmail', 'supportEmail', 'phone', 
                'whatsappNumber', 'socialMedia', 'currency', 'taxPercentage', 
                'deliveryCharge', 'minimumOrderAmount', 'freeDeliveryAmount', 
                'stripeKeys', 'paypalKeys', 'googlePayMerchantId', 
                'logoUrl', 'faviconUrl'
            ];
            
            updatableFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    settings[field] = req.body[field];
                }
            });
            
            await settings.save();
        }

        await logAdminAction(req.user._id, 'UPDATE_SETTINGS', settings._id, 'Setting', req.body, req.ip);
        
        res.status(200).json(new ApiResponse(200, { settings }, 'Settings updated successfully'));
    } catch (error) {
        next(error);
    }
};
