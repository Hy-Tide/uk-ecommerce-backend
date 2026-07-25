const mongoose = require('mongoose');

const variationSchema = new mongoose.Schema({
    weight: { type: Number, required: true, min: 0 },
    weightUnit: { type: String, enum: ['g', 'ml'], required: true },
    regularPrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, default: 0, min: 0 },
    stockQuantity: { type: Number, default: 0, min: 0 },
    minStockAlert: { type: Number, default: 0, min: 0 },
    displayWeight: { type: String }
});

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
    variations: {
        type: [variationSchema],
        validate: [
            {
                validator: function(v) { return v.length <= 5; },
                message: 'Maximum 5 variations are allowed.'
            }
        ],
        default: []
    },
    tags: [{ type: String }],
    inStock: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false, alias: 'is_featured' },
    displayOrder: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'draft' },
    variants: [variantSchema] // Kept for backward compatibility
}, { timestamps: true });

// Pre-validate to handle auto-calculations and constraints
productSchema.pre('validate', function() {
    if (this.variations && this.variations.length > 0) {
        const seenCombinations = new Set();
        let totalStock = 0;

        for (let i = 0; i < this.variations.length; i++) {
            const v = this.variations[i];
            
            // Generate displayWeight
            if (v.weightUnit === 'g' && v.weight >= 1000) {
                const kg = v.weight / 1000;
                v.displayWeight = `${Number.isInteger(kg) ? kg : kg.toFixed(2)}kg`;
            } else if (v.weightUnit === 'ml' && v.weight >= 1000) {
                const l = v.weight / 1000;
                v.displayWeight = `${Number.isInteger(l) ? l : l.toFixed(2)}L`;
            } else {
                v.displayWeight = `${v.weight}${v.weightUnit}`;
            }

            // Uniqueness check
            const key = `${v.weight}-${v.weightUnit}`;
            if (seenCombinations.has(key)) {
                throw new Error(`Duplicate variation found: ${key}`);
            }
            seenCombinations.add(key);

            // Price validation
            if (v.salePrice > v.regularPrice) {
                throw new Error('Sale Price cannot exceed Regular Price.');
            }

            // Sum stock
            totalStock += (v.stockQuantity || 0);
        }

        // Auto-calculate inStock if not explicitly modified
        if (!this.isModified('inStock')) {
            this.inStock = totalStock > 0;
        }
    } else {
        // No variations? Default to out of stock
        if (!this.isModified('inStock')) {
            this.inStock = false;
        }
    }
    
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
});

module.exports = mongoose.model('Product', productSchema);
