const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Delivery zone name is required'], 
        trim: true, 
        unique: true 
    },
    description: { 
        type: String, 
        trim: true 
    },
    shapeType: {
        type: String,
        enum: ['polygon', 'circle'],
        required: [true, 'Shape type is required']
    },
    area: {
        type: { 
            type: String, 
            enum: ['Polygon'], 
            required: true 
        },
        coordinates: { 
            type: [[[Number]]], 
            required: true 
        }
    },
    circleData: {
        center: {
            type: [Number], // [lng, lat]
            required: function() { return this.shapeType === 'circle'; }
        },
        radius: {
            type: Number, // in meters
            required: function() { return this.shapeType === 'circle'; }
        }
    },
    deliveryCharge: { 
        type: Number, 
        default: 0,
        min: [0, 'Delivery charge cannot be negative']
    },
    minimumOrderValue: { 
        type: Number,
        min: [0, 'Minimum order value cannot be negative']
    },
    estimatedDeliveryTime: { 
        type: String, 
        trim: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AdminUser' 
    },
    updatedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'AdminUser' 
    }
}, { timestamps: true });

// Create a 2dsphere index on the area field for geospatial queries
deliveryZoneSchema.index({ area: '2dsphere' });

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);
