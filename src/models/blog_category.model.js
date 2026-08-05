const mongoose = require('mongoose');

const blogCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Blog category name is required'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Blog category slug is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('BlogCategory', blogCategorySchema);
