const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    sku: { type: String, unique: true, sparse: true },
    attributes: { type: mongoose.Schema.Types.Mixed }, // e.g., {"color": "red", "size": "M"}
    price_modifier: { type: Number, default: 0 },
    stock_quantity: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    sub_category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' },
    brand_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },
    base_price: { type: Number, required: true },
    discount_price: { type: Number, default: 0 },
    weight: { type: String },
    unit: { type: String },
    images: [{ type: String }],
    is_featured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
    variants: [variantSchema]
}, { timestamps: true });

// Pre-save to auto-generate slug if needed
productSchema.pre('save', function () {
    if (this.isModified('title')) {
        this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
});

module.exports = mongoose.model('Product', productSchema);
