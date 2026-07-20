const Product = require('../../models/product.model');
const Category = require('../../models/category.model');
const Brand = require('../../models/brand.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

// Full product map including variants
const mapProductDetail = (prod) => ({
    _id: prod._id,
    category_id: prod.category_id,
    sub_category_id: prod.sub_category_id,
    brand_id: prod.brand_id,
    title: prod.title,
    slug: prod.slug,
    description: prod.description,
    base_price: prod.base_price,
    discount_price: prod.discount_price,
    weight: prod.weight,
    unit: prod.unit,
    images: prod.images,
    is_featured: prod.is_featured,
    status: prod.status,
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
    category_id: prod.category_id,
    brand_id: prod.brand_id,
    title: prod.title,
    slug: prod.slug,
    base_price: prod.base_price,
    discount_price: prod.discount_price,
    images: prod.images && prod.images.length > 0 ? [prod.images[0]] : [],
    is_featured: prod.is_featured,
    status: prod.status
});

exports.getProducts = async (req, res, next) => {
    try {
        const { category_id, sub_category_id, brand_id, sort = '-createdAt', page = 1, limit = 12 } = req.query;
        let query = { status: 'active' };

        if (category_id) query.category_id = category_id;
        if (sub_category_id) query.sub_category_id = sub_category_id;
        if (brand_id) query.brand_id = brand_id;

        const skip = (page - 1) * limit;

        const products = await Product.find(query).skip(skip).limit(parseInt(limit)).sort(sort);
        const total = await Product.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            products: products.map(mapProductList),
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Products retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getProductBySlug = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, status: 'active' });
        if (!product) {
            return next(new ApiError(404, 'Product not found or inactive'));
        }
        res.status(200).json(new ApiResponse(200, { product: mapProductDetail(product) }, 'Product retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
