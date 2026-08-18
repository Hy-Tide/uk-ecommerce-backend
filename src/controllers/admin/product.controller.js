const Product = require('../../models/product.model');
const Brand = require('../../models/brand.model');
const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
const { logStockChange } = require('../../utils/stockLogger');
const { processBase64Images } = require('../../utils/base64Helper');

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
    ingredients: prod.ingredients,
    nutritionalInformation: prod.nutritionalInformation,
    highlights: prod.highlights,
    images: prod.images,
    variations: prod.variations ? prod.variations.map(v => ({
        _id: v._id,
        weight: v.weight,
        weightUnit: v.weightUnit,
        regularPrice: v.regularPrice,
        salePrice: v.salePrice,
        stockQuantity: v.stockQuantity,
        minStockAlert: v.minStockAlert,
        displayWeight: v.displayWeight
    })) : [],
    tags: prod.tags,
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
    variations: prod.variations,
    images: prod.images && prod.images.length > 0 ? [prod.images[0]] : [],
    isFeatured: prod.isFeatured,
    displayOrder: prod.displayOrder,
    status: prod.status,
    inStock: prod.inStock,
    
    category_id: prod.categoryId,
    brand_id: prod.brand,
    title: prod.name,
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

        if (req.body.displayOrder !== undefined) {
            await Product.updateMany(
                { categoryId: req.body.categoryId, displayOrder: { $gte: req.body.displayOrder } },
                { $inc: { displayOrder: 1 } }
            );
        }

        let existingImages = [];
        if (req.body.images) {
            existingImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        existingImages = await processBase64Images(existingImages, baseUrl);

        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
            req.body.images = [...existingImages, ...newImageUrls];
        } else {
            req.body.images = existingImages;
        }

        const product = await Product.create(req.body);
        
        // Log stock addition for new products
        if (product.variations && product.variations.length > 0) {
            for (let v of product.variations) {
                if (v.stockQuantity && v.stockQuantity > 0) {
                    await logStockChange({
                        productId: product._id,
                        variationId: v._id,
                        action: 'STOCK_ADDED',
                        quantityChanged: v.stockQuantity,
                        previousStock: 0,
                        newStock: v.stockQuantity,
                        reason: 'Initial Stock via Product Creation',
                        user: req.user ? req.user._id : null,
                        userModel: 'AdminUser'
                    });
                }
            }
        }

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
            query['variations.regularPrice'] = {};
            if (minPrice) query['variations.regularPrice'].$gte = Number(minPrice);
            if (maxPrice) query['variations.regularPrice'].$lte = Number(maxPrice);
        }

        // Sorting
        let sortOption = {};
        if (sort === 'name') sortOption.name = 1;
        else if (sort === '-name') sortOption.name = -1;
        else if (sort === 'price') sortOption['variations.regularPrice'] = 1;
        else if (sort === '-price') sortOption['variations.regularPrice'] = -1;
        else if (sort === 'displayOrder') sortOption.displayOrder = 1;
        else sortOption.createdAt = -1; // newest by default

        const skip = (page - 1) * limit;

        const products = await Product.find(query).select('-description -ingredients -nutritionalInformation -highlights').skip(skip).limit(parseInt(limit)).sort(sortOption);
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

        if (req.body.displayOrder !== undefined && Number(req.body.displayOrder) !== product.displayOrder) {
            await Product.updateMany(
                { 
                    categoryId: req.body.categoryId || product.categoryId, 
                    displayOrder: { $gte: Number(req.body.displayOrder) },
                    _id: { $ne: product._id }
                },
                { $inc: { displayOrder: 1 } }
            );
        }

        let existingImages = [];
        if (req.body.images) {
            existingImages = Array.isArray(req.body.images) ? req.body.images : [req.body.images];
        }

        const baseUrl = `${req.protocol}://${req.get('host')}`;
        existingImages = await processBase64Images(existingImages, baseUrl);

        if (req.files && req.files.length > 0) {
            const newImageUrls = req.files.map(file => `${baseUrl}/uploads/${file.filename}`);
            req.body.images = [...existingImages, ...newImageUrls];
        } else if (req.body.images !== undefined) {
            req.body.images = existingImages;
        }

        if (req.body.images !== undefined && product.images) {
            const imagesToDelete = product.images.filter(img => !req.body.images.includes(img));
            imagesToDelete.forEach(oldImage => {
                if (oldImage && oldImage.includes('/uploads/')) {
                    const oldFilename = oldImage.split('/uploads/')[1];
                    const oldFilePath = path.join(__dirname, '../../../uploads', oldFilename);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
            });
        }

        const oldVariations = (product.variations || []).map(v => ({
            id: v._id,
            key: `${v.weight}-${v.weightUnit}`,
            stock: v.stockQuantity || 0
        }));

        Object.assign(product, req.body);
        await product.save();
        
        const newVariations = product.variations || [];
        for (let newVar of newVariations) {
            const key = `${newVar.weight}-${newVar.weightUnit}`;
            const oldVar = oldVariations.find(ov => ov.key === key);
            
            const oldStock = oldVar ? oldVar.stock : 0;
            const newStock = newVar.stockQuantity || 0;
            
            if (oldStock !== newStock) {
                const quantityChanged = Math.abs(newStock - oldStock);
                let finalAction = 'STOCK_ADJUSTED';
                if (!oldVar) finalAction = 'STOCK_ADDED';
                
                await logStockChange({
                    productId: product._id,
                    variationId: newVar._id,
                    action: finalAction,
                    quantityChanged,
                    previousStock: oldStock,
                    newStock: newStock,
                    reason: 'Admin Product Update',
                    user: req.user ? req.user._id : null,
                    userModel: 'AdminUser'
                });
            }
        }

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

exports.getMostViewedProducts = async (req, res, next) => {
    try {
        const products = await Product.find().select('-description -ingredients -nutritionalInformation -highlights').sort({ viewCount: -1 }).limit(20);
        const mapped = products.map(p => ({
            _id: p._id,
            name: p.name,
            viewCount: p.viewCount,
            stock: (p.variations || []).reduce((acc, curr) => acc + (curr.stockQuantity || 0), 0)
        }));
        res.status(200).json(new ApiResponse(200, { products: mapped }, 'Most viewed products retrieved'));
    } catch (error) { next(error); }
};

exports.getTrendingProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isTrending: true }).select('-description -ingredients -nutritionalInformation -highlights');
        res.status(200).json(new ApiResponse(200, { products: products.map(mapProductList) }, 'Trending products retrieved'));
    } catch (error) { next(error); }
};

exports.getBestSellerProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isBestSeller: true }).select('-description -ingredients -nutritionalInformation -highlights');
        res.status(200).json(new ApiResponse(200, { products: products.map(mapProductList) }, 'Best seller products retrieved'));
    } catch (error) { next(error); }
};

exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ isFeatured: true }).select('-description -ingredients -nutritionalInformation -highlights');
        res.status(200).json(new ApiResponse(200, { products: products.map(mapProductList) }, 'Featured products retrieved'));
    } catch (error) { next(error); }
};

exports.getRelatedProducts = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(new ApiError(404, 'Product not found'));
        
        let query = { _id: { $ne: product._id } };
        if (product.relatedProducts && product.relatedProducts.length > 0) {
            query._id = { $in: product.relatedProducts, $ne: product._id };
        } else {
            query.categoryId = product.categoryId;
        }

        const products = await Product.find(query).select('-description -ingredients -nutritionalInformation -highlights').limit(10);
        res.status(200).json(new ApiResponse(200, { products: products.map(mapProductList) }, 'Related products retrieved'));
    } catch (error) { next(error); }
};

exports.toggleFeatured = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(new ApiError(404, 'Product not found'));
        product.isFeatured = !product.isFeatured;
        await product.save();
        res.status(200).json(new ApiResponse(200, { _id: product._id, isFeatured: product.isFeatured }, 'Featured status updated successfully'));
    } catch (error) { next(error); }
};

exports.toggleBestSeller = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(new ApiError(404, 'Product not found'));
        product.isBestSeller = !product.isBestSeller;
        await product.save();
        res.status(200).json(new ApiResponse(200, { _id: product._id, isBestSeller: product.isBestSeller }, 'Best seller status updated successfully'));
    } catch (error) { next(error); }
};

exports.toggleStatus = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(new ApiError(404, 'Product not found'));
        product.status = product.status === 'active' ? 'inactive' : 'active';
        await product.save();
        res.status(200).json(new ApiResponse(200, { _id: product._id, status: product.status }, 'Status updated successfully'));
    } catch (error) { next(error); }
};

exports.toggleInStock = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return next(new ApiError(404, 'Product not found'));
        product.inStock = !product.inStock;
        await product.save();
        res.status(200).json(new ApiResponse(200, { _id: product._id, inStock: product.inStock }, 'In-stock status updated successfully'));
    } catch (error) { next(error); }
};
