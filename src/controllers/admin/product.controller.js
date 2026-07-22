const Product = require('../../models/product.model');
const Brand = require('../../models/brand.model');
const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

// Full product map including variants (supports both old and new fields for backward compatibility)
const mapProductDetail = (prod) => ({
    _id: prod._id,
    
    // New CamelCase fields
    categoryId: prod.categoryId,
    subCategoryId: prod.subCategoryId,
    brand: prod.brand,
    name: prod.name,
    slug: prod.slug,
    sku: prod.sku,
    shortDescription: prod.shortDescription,
    description: prod.description,
    images: prod.images,
    weight: prod.weight,
    weightUnit: prod.weightUnit,
    tags: prod.tags,
    price: prod.price,
    salePrice: prod.salePrice,
    stockQuantity: prod.stockQuantity,
    inStock: prod.inStock,
    isFeatured: prod.isFeatured,
    displayOrder: prod.displayOrder,
    status: prod.status,
    createdAt: prod.createdAt,
    updatedAt: prod.updatedAt,
    
    // Old fields for backward compatibility
    category_id: prod.categoryId,
    sub_category_id: prod.subCategoryId,
    brand_id: prod.brand,
    title: prod.name,
    base_price: prod.price,
    discount_price: prod.salePrice,
    unit: prod.weightUnit,
    is_featured: prod.isFeatured,
    
    variants: (prod.variants || []).map(v => ({
        _id: v._id,
        sku: v.sku,
        attributes: v.attributes,
        price_modifier: v.price_modifier,
        stock_quantity: v.stock_quantity
    })),
    created_at: prod.createdAt,
    updated_at: prod.updatedAt
});

// Lightweight mapping for lists
const mapProductList = (prod) => ({
    _id: prod._id,
    categoryId: prod.categoryId,
    brand: prod.brand,
    name: prod.name,
    slug: prod.slug,
    price: prod.price,
    salePrice: prod.salePrice,
    images: prod.images && prod.images.length > 0 ? [prod.images[0]] : [],
    isFeatured: prod.isFeatured,
    status: prod.status,
    stockQuantity: prod.stockQuantity,
    inStock: prod.inStock,
    
    // Old fields for backward compatibility
    category_id: prod.categoryId,
    brand_id: prod.brand,
    title: prod.name,
    base_price: prod.price,
    discount_price: prod.salePrice,
    is_featured: prod.isFeatured
});

exports.createProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const checkTitle = req.body.name || req.body.title;
        const existing = await Product.findOne({ name: checkTitle });
        if (existing) {
            return next(new ApiError(409, 'Product with this name/title already exists'));
        }
        
        if (req.body.sku) {
            const existingSku = await Product.findOne({ sku: req.body.sku });
            if (existingSku) {
                return next(new ApiError(409, 'Product with this SKU already exists'));
            }
        }

        if (req.body.brand && !mongoose.Types.ObjectId.isValid(req.body.brand)) {
            let brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${req.body.brand}$`, 'i') } });
            if (!brandDoc) {
                 brandDoc = await Brand.create({ name: req.body.brand });
            }
            req.body.brand = brandDoc._id;
        }

        const product = await Product.create(req.body);
        res.status(201).json(new ApiResponse(201, { product: mapProductDetail(product) }, 'Product created successfully'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(409, 'Duplicate key error (Slug or SKU already exists)'));
        }
        next(error);
    }
};

exports.getAllProducts = async (req, res, next) => {
    try {
        const { 
            search, page = 1, limit = 10, status, 
            category_id, categoryId, 
            brand_id, brand,
            subCategoryId, tags, isFeatured, 
            minPrice, maxPrice, sort 
        } = req.query;
        
        let query = {};

        // Backward compatibility for filters
        const qCategoryId = categoryId || category_id;
        const qBrand = brand || brand_id;

        if (search) query.name = { $regex: search, $options: 'i' };
        if (status) query.status = status;
        if (qCategoryId) query.categoryId = qCategoryId;
        if (subCategoryId) query.subCategoryId = subCategoryId;
        if (qBrand) query.brand = qBrand;
        if (tags) query.tags = { $in: tags.split(',') };
        if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
        
        // Price filtering
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Sorting
        let sortOption = {};
        if (sort === 'name') sortOption.name = 1;
        else if (sort === '-name') sortOption.name = -1;
        else if (sort === 'price') sortOption.price = 1;
        else if (sort === '-price') sortOption.price = -1;
        else if (sort === 'displayOrder') sortOption.displayOrder = 1;
        else sortOption.createdAt = -1; // newest by default

        const skip = (page - 1) * limit;

        const products = await Product.find(query).skip(skip).limit(parseInt(limit)).sort(sortOption);
        const total = await Product.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            products: products.map(mapProductList),
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Products retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }
        res.status(200).json(new ApiResponse(200, { product: mapProductDetail(product) }, 'Product retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }

        if (req.body.brand && !mongoose.Types.ObjectId.isValid(req.body.brand)) {
            let brandDoc = await Brand.findOne({ name: { $regex: new RegExp(`^${req.body.brand}$`, 'i') } });
            if (!brandDoc) {
                 brandDoc = await Brand.create({ name: req.body.brand });
            }
            req.body.brand = brandDoc._id;
        }

        Object.assign(product, req.body);
        await product.save();

        res.status(200).json(new ApiResponse(200, { product: mapProductDetail(product) }, 'Product updated successfully'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(409, 'Duplicate key error (Slug or SKU already exists)'));
        }
        next(error);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return next(new ApiError(404, 'Product not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
    } catch (error) {
        next(error);
    }
};

