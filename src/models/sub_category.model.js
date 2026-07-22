const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: [true, 'Subcategory name is required'], trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, trim: true },
    image: { type: String },
    image_url: { type: String },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

// Pre-save to auto-generate slug if needed
subCategorySchema.pre('save', function () {
    if (!this.slug && this.name) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
});

module.exports = mongoose.model('SubCategory', subCategorySchema);
