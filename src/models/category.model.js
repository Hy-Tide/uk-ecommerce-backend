const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: [true, 'Category name is required'], trim: true, unique: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, trim: true },
    image: { type: String },
    icon: { type: String },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true }
}, { timestamps: true });

// Pre-save to auto-generate slug if needed
categorySchema.pre('save', function () {
    if (!this.slug && this.name) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
});

module.exports = mongoose.model('Category', categorySchema);
