const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    sku: { type: String, unique: true, sparse: true },
    attributes: { type: mongoose.Schema.Types.Mixed }, // e.g., {"color": "red", "size": "M"}
    price_modifier: { type: Number, default: 0 },
    stock_quantity: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, alias: 'category_id' },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory', alias: 'sub_category_id' },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', alias: 'brand_id' },
    name: { type: String, required: true, trim: true, alias: 'title' },
    slug: { type: String, unique: true, lowercase: true },
    sku: { type: String, unique: true, required: true },
    shortDescription: { type: String },
    description: { type: String },
    images: [{ type: String }],
    weight: { type: String, required: true },
    weightUnit: { type: String, enum: ['g', 'kg', 'ml', 'L', 'pcs'], default: 'g', alias: 'unit' },
    tags: [{ type: String }],
    price: { type: Number, required: true, alias: 'base_price' },
    salePrice: { type: Number, default: 0, alias: 'discount_price' },
    stockQuantity: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false, alias: 'is_featured' },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'draft' },
    variants: [variantSchema] // Kept for backward compatibility
}, { timestamps: true });

// Pre-save to auto-generate slug if needed and calculate inStock
productSchema.pre('save', function () {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    // Auto-calculate inStock if not explicitly modified
    if (!this.isModified('inStock')) {
        this.inStock = this.stockQuantity > 0;
    }
});

module.exports = mongoose.model('Product', productSchema);
