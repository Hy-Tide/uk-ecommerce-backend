const Product = require('../../models/product.model');
const OfferProduct = require('../../models/offer_product.model');
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
const mapProductList = (prod, activeOffer = null) => {
    let basePrice = 0;
    let discountPrice = 0;
    let badge = null;
    let mappedVariations = [];

    if (prod.variations && prod.variations.length > 0) {
        mappedVariations = prod.variations.map(v => {
            let salePrice = v.salePrice;
            if (activeOffer) {
                if (activeOffer.discountType === 'percentage') {
                    const discount = v.regularPrice * (activeOffer.discountValue / 100);
                    salePrice = Math.max(0, v.regularPrice - discount);
                } else if (activeOffer.discountType === 'fixed') {
                    salePrice = Math.max(0, v.regularPrice - activeOffer.discountValue);
                }
            }
            return {
                _id: v._id,
                weight: v.weight,
                weightUnit: v.weightUnit,
                regularPrice: v.regularPrice,
                salePrice: salePrice,
                stockQuantity: v.stockQuantity,
                minStockAlert: v.minStockAlert,
                displayWeight: v.displayWeight
            };
        });

        basePrice = mappedVariations[0].regularPrice;
        discountPrice = mappedVariations[0].salePrice;
        badge = calculateBadge(basePrice, discountPrice, prod.createdAt);
    } else {
        badge = calculateBadge(0, 0, prod.createdAt);
    }

    return {
        id: prod._id, // Frontend often uses `id` instead of `_id`
        name: prod.name,
        slug: prod.slug,
        brand: prod.brand, // Ideally populated
        category: prod.categoryId, // Ideally populated
        subCategory: prod.subCategoryId, // Ideally populated
        displayOrder: prod.displayOrder,
        mainImage: prod.images && prod.images.length > 0 ? prod.images[0] : null,
        variations: mappedVariations,
        badge: badge,
        activeOffer: activeOffer ? { id: activeOffer._id, title: activeOffer.title } : null
    };
};

// Map for Website Product Details
const mapProductDetail = (prod, activeOffer = null) => {
    const listFields = mapProductList(prod, activeOffer);
    
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

const applyOffersToProducts = async (products, isDetail = false) => {
    if (!products || products.length === 0) return [];
    
    const productIds = products.map(p => p._id);
    const mappings = await OfferProduct.find({ productId: { $in: productIds } }).populate('offerId');
    const now = new Date();
    
    const activeOfferMap = new Map();
    mappings.forEach(m => {
        const offer = m.offerId;
        if (offer && offer.isActive && now >= offer.startDate && now <= offer.endDate) {
            if (!offer.scheduledAt || now >= offer.scheduledAt) {
                if (!activeOfferMap.has(m.productId.toString())) {
                    activeOfferMap.set(m.productId.toString(), offer);
                }
            }
        }
    });

    return products.map(prod => {
        const activeOffer = activeOfferMap.get(prod._id.toString());
        return isDetail ? mapProductDetail(prod, activeOffer) : mapProductList(prod, activeOffer);
    });
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
            .select('-description -ingredients -nutritionalInformation -highlights')
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortOption)
            .populate('categoryId', 'name slug image icon')
            .populate('subCategoryId', 'name slug')
            .populate('brand', 'name slug');
            
        const total = await Product.countDocuments(query);

        const mappedProducts = await applyOffersToProducts(products);
        res.status(200).json(new ApiResponse(200, {
            products: mappedProducts,
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
        
        const mappedProducts = await applyOffersToProducts([product], true);
        res.status(200).json(new ApiResponse(200, { product: mappedProducts[0] }, 'Product retrieved successfully'));
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
            .select('-description -ingredients -nutritionalInformation -highlights')
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortOption)
            .populate('categoryId', 'name slug image icon')
            .populate('subCategoryId', 'name slug')
            .populate('brand', 'name slug');
            
        const total = await Product.countDocuments(query);

        const mappedProducts = await applyOffersToProducts(products);
        res.status(200).json(new ApiResponse(200, {
            products: mappedProducts,
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
            .select('-description -ingredients -nutritionalInformation -highlights')
            .skip(skip)
            .limit(parseInt(limit))
            .sort(sortOption)
            .populate('categoryId', 'name slug image icon')
            .populate('subCategoryId', 'name slug')
            .populate('brand', 'name slug');
            
        const total = await Product.countDocuments(query);

        const mappedProducts = await applyOffersToProducts(products);
        res.status(200).json(new ApiResponse(200, {
            products: mappedProducts,
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

        const products = await Product.find(query).select('-description -ingredients -nutritionalInformation -highlights').limit(10).populate('categoryId', 'name slug image icon');
        const mappedProducts = await applyOffersToProducts(products);
        res.status(200).json(new ApiResponse(200, { products: mappedProducts }, 'Related products retrieved successfully'));
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
            .select('-description -ingredients -nutritionalInformation -highlights')
            .populate('categoryId', 'name slug image icon');
            
        // Sort products to match the order of productIds
        const productMap = new Map(products.map(p => [p._id.toString(), p]));
        const sortedProducts = productIds.map(id => productMap.get(id.toString())).filter(Boolean);
        const mappedProducts = await applyOffersToProducts(sortedProducts);
        res.status(200).json(new ApiResponse(200, { products: mappedProducts }, 'Recently viewed products retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ status: 'active', isFeatured: true }).select('-description -ingredients -nutritionalInformation -highlights').limit(10).populate('categoryId', 'name slug image icon');
        const mappedProducts = await applyOffersToProducts(products);
        res.status(200).json(new ApiResponse(200, { products: mappedProducts }, 'Featured products retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getBestSellingProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ status: 'active', isBestSeller: true }).select('-description -ingredients -nutritionalInformation -highlights').limit(10).populate('categoryId', 'name slug image icon');
        const mappedProducts = await applyOffersToProducts(products);
        res.status(200).json(new ApiResponse(200, { products: mappedProducts }, 'Best selling products retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getNewArrivalsProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ status: 'active' }).select('-description -ingredients -nutritionalInformation -highlights').sort({ createdAt: -1 }).limit(10).populate('categoryId', 'name slug image icon');
        const mappedProducts = await applyOffersToProducts(products);
        res.status(200).json(new ApiResponse(200, { products: mappedProducts }, 'New arrivals retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
