const Product = require('../../models/product.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

// Helper to calculate badge based on price and dates (example logic)
const calculateBadge = (price, salePrice, createdAt) => {
    if (salePrice > 0 && salePrice < price) {
        const discount = Math.round(((price - salePrice) / price) * 100);
        return { text: `-${discount}%`, type: 'discount' };
    }
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (new Date(createdAt) > oneWeekAgo) {
        return { text: 'New', type: 'new' };
    }
    return null;
};

// Map for Website Product Listing
const mapProductList = (prod) => ({
    id: prod._id, // Frontend often uses `id` instead of `_id`
    name: prod.name,
    slug: prod.slug,
    brand: prod.brand, // Ideally populated
    weight: `${prod.weight}${prod.weightUnit}`,
    category: prod.categoryId, // Ideally populated
    subCategory: prod.subCategoryId, // Ideally populated
    mainImage: prod.images && prod.images.length > 0 ? prod.images[0] : null,
    price: prod.salePrice > 0 ? prod.salePrice : prod.price,
    oldPrice: prod.salePrice > 0 ? prod.price : null,
    badge: calculateBadge(prod.price, prod.salePrice, prod.createdAt)
});

// Map for Website Product Details
const mapProductDetail = (prod) => {
    const listFields = mapProductList(prod);
    
    return {
        ...listFields,
        description: prod.description,
        highlights: prod.shortDescription ? [prod.shortDescription] : [],
        features: prod.tags || [],
        stockCount: prod.stockQuantity,
        // Mocked calculations (to be implemented with reviews module)
        rating: 5.0, 
        reviewCount: 0, 
        soldCount: "0+ sold recently"
    };
};

exports.getProducts = async (req, res, next) => {
    try {
        const { 
            category, subCategory, brand, 
            search, tags, isFeatured, 
            minPrice, maxPrice, sort,
            page = 1, limit = 12 
        } = req.query;
        
        let query = { status: 'active' };

        // We also support the old `category_id` query param if frontend still sends it
        const qCategory = category || req.query.category_id || req.query.categoryId;
        const qSubCategory = subCategory || req.query.sub_category_id || req.query.subCategoryId;
        const qBrand = brand || req.query.brand_id;

        if (qCategory) query.categoryId = qCategory;
        if (qSubCategory) query.subCategoryId = qSubCategory;
        if (qBrand) query.brand = qBrand;
        if (search) query.name = { $regex: search, $options: 'i' };
        if (tags) query.tags = { $in: tags.split(',') };
        if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';

        // Price filtering
        if (minPrice || maxPrice) {
            // It could be base price or sale price, simple filter on base price for now
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

        const products = await Product.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortOption)
            .populate('categoryId', 'name slug image icon')
            .populate('subCategoryId', 'name slug')
            .populate('brand', 'name slug');
            
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
        const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
            .populate('categoryId', 'name slug image icon')
            .populate('subCategoryId', 'name slug')
            .populate('brand', 'name slug');
            
        if (!product) {
            return next(new ApiError(404, 'Product not found or inactive'));
        }
        res.status(200).json(new ApiResponse(200, { product: mapProductDetail(product) }, 'Product retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

