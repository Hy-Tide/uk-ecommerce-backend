const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Banner title is required'],
        trim: true
    },
    image_url: {
        type: String,
        required: [true, 'Banner image URL is required']
    },
    pageType: {
        type: String,
        enum: ['offers', 'blogs', 'recipes', 'contact-us'],
        required: [true, 'Page type is required']
    },
    link: {
        type: String,
        trim: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
