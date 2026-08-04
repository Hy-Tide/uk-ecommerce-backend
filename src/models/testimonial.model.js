const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Testimonial content is required']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },
    image_url: {
        type: String,
        trim: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
