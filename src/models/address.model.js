const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Address must belong to a user'],
        },
        name: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        type: {
            type: String,
            enum: ['home', 'work', 'others'],
            default: 'others',
        },
        house_number: {
            type: String,
            required: [true, 'Please provide a house number'],
            trim: true,
        },
        street_address: {
            type: String,
            required: [true, 'Please provide a street address'],
            trim: true,
        },
        city: {
            type: String,
            required: [true, 'Please provide a city'],
            trim: true,
        },
        county: {
            type: String,
            trim: true,
        },
        postcode: {
            type: String,
            required: [true, 'Please provide a postcode'],
            trim: true,
        },
        country: {
            type: String,
            default: 'UK',
            trim: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: undefined,
            }
        },
        is_default: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Address = mongoose.model('Address', addressSchema);
module.exports = Address;
