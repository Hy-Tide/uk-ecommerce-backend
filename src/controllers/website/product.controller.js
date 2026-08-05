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
const mapProductList = (prod) => {
    let basePrice = 0;
    let discountPrice = 0;
    let badge = null;

    if (prod.variations && prod.variations.length > 0) {
        basePrice = prod.variations[0].regularPrice;
        discountPrice = prod.variations[0].salePrice;
        badge = calculateBadge(basePrice, discountPrice, prod.createdAt);
    } else {
        badge = calculateBadge(0, 0, prod.createdAt);
    }

    return {
        id: prod._id, // Frontend often uses `id` instead of `_id`
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        ingredients: prod.ingredients,
        nutritionalInformation: prod.nutritionalInformation,
        nutritionalInfo: prod.nutritionalInformation,
        highlights: prod.highlights,
        brand: prod.brand, // Ideally populated
        category: prod.categoryId, // Ideally populated
        subCategory: prod.subCategoryId, // Ideally populated
        displayOrder: prod.displayOrder,
        mainImage: prod.images && prod.images.length > 0 ? prod.images[0] : null,
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
        badge: badge
    };
};

// Map for Website Product Details
const mapProductDetail = (prod) => {
    const listFields = mapProductList(prod);
    
    const totalStock = (prod.variations || []).reduce((acc, curr) => acc + (curr.stockQuantity || 0), 0);

    return {
        ...listFields,
        description: prod.description,
        ingredients: prod.ingredients,
        nutritionalInformation: prod.nutritionalInformation,
        nutritionalInfo: prod.nutritionalInformation,
        highlights: prod.highlights,
        features: prod.tags || [],
        stockCount: totalStock,
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
        const product = await Product.findOneAndUpdate(
            { slug: req.params.slug, status: 'active' },
            { $inc: { viewCount: 1 } },
            { new: true }
        )
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

exports.getProductsByCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { 
            page = 1, limit = 12, sort 
        } = req.query;
        
        let query = { status: 'active', categoryId };

        // Sorting
        let sortOption = {};
        if (sort === 'name') sortOption.name = 1;
        else if (sort === '-name') sortOption.name = -1;
        else if (sort === 'price') sortOption['variations.regularPrice'] = 1;
        else if (sort === '-price') sortOption['variations.regularPrice'] = -1;
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
        }, 'Products by category retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getProductsBySubCategory = async (req, res, next) => {
    try {
        const { subCategoryId } = req.params;
        const { 
            page = 1, limit = 12, sort 
        } = req.query;
        
        let query = { status: 'active', subCategoryId };

        // Sorting
        let sortOption = {};
        if (sort === 'name') sortOption.name = 1;
        else if (sort === '-name') sortOption.name = -1;
        else if (sort === 'price') sortOption['variations.regularPrice'] = 1;
        else if (sort === '-price') sortOption['variations.regularPrice'] = -1;
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
        }, 'Products by sub-category retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getRelatedProducts = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, status: 'active' });
        if (!product) return next(new ApiError(404, 'Product not found'));

        let query = { status: 'active', _id: { $ne: product._id } };
        
        if (product.relatedProducts && product.relatedProducts.length > 0) {
            query._id = { $in: product.relatedProducts, $ne: product._id };
        } else {
            query.categoryId = product.categoryId;
        }

        const products = await Product.find(query).limit(10).populate('categoryId', 'name slug image icon');
        res.status(200).json(new ApiResponse(200, { products: products.map(mapProductList) }, 'Related products retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getRecentlyViewedProducts = async (req, res, next) => {
    try {
        const { productIds } = req.body;
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(200).json(new ApiResponse(200, { products: [] }, 'No recently viewed products'));
        }

        const products = await Product.find({ _id: { $in: productIds }, status: 'active' })
            .populate('categoryId', 'name slug image icon');
            
        // Sort products to match the order of productIds
        const productMap = new Map(products.map(p => [p._id.toString(), p]));
        const sortedProducts = productIds.map(id => productMap.get(id.toString())).filter(Boolean);

        res.status(200).json(new ApiResponse(200, { products: sortedProducts.map(mapProductList) }, 'Recently viewed products retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ status: 'active', isFeatured: true }).limit(10).populate('categoryId', 'name slug image icon');
        res.status(200).json(new ApiResponse(200, { products: products.map(mapProductList) }, 'Featured products retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getBestSellingProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ status: 'active', isBestSeller: true }).limit(10).populate('categoryId', 'name slug image icon');
        res.status(200).json(new ApiResponse(200, { products: products.map(mapProductList) }, 'Best selling products retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getNewArrivalsProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ status: 'active' }).sort({ createdAt: -1 }).limit(10).populate('categoryId', 'name slug image icon');
        res.status(200).json(new ApiResponse(200, { products: products.map(mapProductList) }, 'New arrivals retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
