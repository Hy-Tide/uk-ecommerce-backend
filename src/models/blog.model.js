const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Blog slug is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    summary: {
        type: String,
        required: [true, 'Blog summary is required']
    },
    content: {
        type: String, // HTML/Rich text
        required: [true, 'Blog content is required']
    },
    featuredImage: {
        type: String
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogCategory',
        required: [true, 'Blog category is required']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser', // Assuming the admin user model is named 'AdminUser'
        required: [true, 'Author is required']
    },
    tags: [{
        type: String,
        trim: true
    }],
    isFeatured: {
        type: Boolean,
        default: false
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    metaTitle: {
        type: String
    },
    metaDescription: {
        type: String
    },
    metaKeywords: {
        type: String
    },
    readingTime: {
        type: String // e.g., '5 mins'
    },
    views: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    publishedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
