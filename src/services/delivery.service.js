const DeliveryZone = require('../models/delivery_zone.model');

/**
 * Check if a location falls inside any active delivery zone
 * @param {Number} latitude 
 * @param {Number} longitude 
 * @returns {Object} { isDeliverable, deliveryType, deliveryCharge, zoneId }
 */
exports.checkDeliveryAvailability = async (latitude, longitude) => {
    // MongoDB uses [longitude, latitude] for GeoJSON
    const point = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)]
    };

    const zone = await DeliveryZone.findOne({
        isActive: true,
        area: {
            $geoIntersects: {
                $geometry: point
            }
        }
    }).sort({ deliveryCharge: 1 }); // If overlapping zones, pick the cheapest

    if (zone) {
        return {
            isDeliverable: true,
            deliveryType: 'OWN_DELIVERY',
            deliveryCharge: zone.deliveryCharge,
            minimumOrderValue: zone.minimumOrderValue,
            estimatedDeliveryTime: zone.estimatedDeliveryTime,
            zoneId: zone._id,
            zoneName: zone.name
        };
    }

    return {
        isDeliverable: false,
        deliveryType: null,
        message: 'Delivery not available in this area'
    };
};
