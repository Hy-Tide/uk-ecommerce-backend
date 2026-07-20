const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Brand name is required'], trim: true, unique: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, trim: true },
    image_url: { type: String },
    is_active: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save to auto-generate slug if needed
brandSchema.pre('save', function () {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
});

module.exports = mongoose.model('Brand', brandSchema);
