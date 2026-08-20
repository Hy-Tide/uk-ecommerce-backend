const HomeConfiguration = require('../../models/home_configuration.model');
const homeConfigurationService = require('../../services/home_configuration.service');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

const formatProducts = (products, isLimited = false) => {
    if (!products) return [];
    return products.map(product => {
        let p = product.toObject ? product.toObject() : product;
        
        let formattedVariations = [];
        let totalStock = 0;
        if (p.variations && p.variations.length > 0) {
            formattedVariations = p.variations.map(v => {
                let stock = v.stockQuantity || 0;
                totalStock += stock;
                return {
                    weight: v.weight,
                    unit: v.weightUnit,
                    displayWeight: v.displayWeight,
                    price: v.salePrice > 0 ? v.salePrice : v.regularPrice,
                    originalPrice: v.regularPrice,
                    stock: stock
                };
            });
        }

        let price = p.price || 0;
        let originalPrice = p.price || 0;
        if (formattedVariations.length > 0) {
            price = formattedVariations[0].price;
            originalPrice = formattedVariations[0].originalPrice;
        }

        let formatted = {
            productId: p._id,
            name: p.name || p.title || '',
            image: (p.images && p.images.length > 0) ? p.images[0] : null,
            price: price,
            originalPrice: originalPrice,
            discount: originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
            rating: p.rating || 0,
            reviewCount: p.reviewCount || 0,
            category: p.categoryId || p.category_id,
            stock: p.inStock !== undefined ? p.inStock : true,
            isActive: p.status === 'active' || p.isActive !== false,
            variations: formattedVariations
        };

        if (isLimited) {
            formatted.currentStock = totalStock;
            formatted.availableQuantity = totalStock;
            // Without a max stock field, we assume 100 as a base for percentage representation
            formatted.stockPercentage = totalStock > 100 ? 100 : (totalStock < 0 ? 0 : totalStock);
        }

        return formatted;
    });
};

const getSectionByType = async (sectionType, req, res, next, formatAsProduct = false, isLimited = false) => {
    try {
        const section = await HomeConfiguration.findOne({ sectionType, enabled: true });
        if (!section) {
            return res.status(200).json(new ApiResponse(200, [], `${sectionType} section not found or disabled`));
        }

        const resolved = await homeConfigurationService.resolveSectionData(section);
        let data = resolved.data || [];

        if (formatAsProduct) {
            data = formatProducts(data, isLimited);
        }

        // Attach section metadata if needed, but the requirement suggests returning the section data directly
        // Some sections like features might just need the items.
        // Let's return the whole resolved object so frontend has title, subtitle etc.
        if (formatAsProduct) {
            resolved.data = data;
        }

        res.status(200).json(new ApiResponse(200, resolved, `${sectionType} retrieved successfully`));
    } catch (error) {
        next(error);
    }
};

exports.getFeatures = (req, res, next) => getSectionByType('Service Features', req, res, next);
exports.getBanners = (req, res, next) => getSectionByType('Hero Banner', req, res, next); // Can also be Promotional Banner Grid based on frontend
exports.getCategories = (req, res, next) => getSectionByType('Shop by Categories', req, res, next);
exports.getBestDeals = (req, res, next) => getSectionByType('Today\'s Best Deals', req, res, next, true);
exports.getLimitedProducts = (req, res, next) => getSectionByType('Limited Products', req, res, next, true, true);
exports.getSubscriptionBanner = (req, res, next) => getSectionByType('Subscription Banner', req, res, next);
exports.getBrands = (req, res, next) => getSectionByType('Shop by Brands', req, res, next);
exports.getNewArrivals = (req, res, next) => getSectionByType('New Arrivals', req, res, next, true);
exports.getPopularRecipes = (req, res, next) => getSectionByType('Popular Recipes', req, res, next);
exports.getTestimonials = (req, res, next) => getSectionByType('Testimonials', req, res, next);
exports.getWhyChooseUs = (req, res, next) => getSectionByType('Why Choose Us', req, res, next);
exports.getOffers = (req, res, next) => getSectionByType('Offer Banners', req, res, next);

exports.getHomepage = async (req, res, next) => {
    try {
        const sections = await HomeConfiguration.find({ enabled: true }).sort('displayOrder createdAt');
        const resolvedSectionsPromises = sections.map(section => homeConfigurationService.resolveSectionData(section));
        const homepageData = await Promise.all(resolvedSectionsPromises);

        const responseData = {
            features: [],
            banners: [],
            categories: [],
            bestDeals: [],
            limitedProducts: [],
            subscriptionBanner: {},
            brands: [],
            newArrivals: [],
            popularRecipes: [],
            testimonials: [],
            whyChooseUs: [],
            offers: [],
            settings: {} // This should ideally be fetched from Setting model, but we will leave empty here as per structure or fetch it
        };

        const Setting = require('../../models/setting.model');
        let setting = await Setting.findOne();
        if (setting) {
            responseData.settings = {
                whatsappNumber: setting.whatsappNumber,
                supportEmail: setting.supportEmail,
                phone: setting.phone
            };
        }

        homepageData.forEach(section => {
            if (section.sectionType === 'Service Features') responseData.features = section;
            else if (section.sectionType === 'Hero Banner' || section.sectionType === 'Promotional Banner Grid') responseData.banners = section;
            else if (section.sectionType === 'Shop by Categories') responseData.categories = section;
            else if (section.sectionType === 'Today\'s Best Deals') {
                section.data = formatProducts(section.data, false);
                responseData.bestDeals = section;
            }
            else if (section.sectionType === 'Limited Products') {
                section.data = formatProducts(section.data, true);
                responseData.limitedProducts = section;
            }
            else if (section.sectionType === 'Subscription Banner') responseData.subscriptionBanner = section;
            else if (section.sectionType === 'Shop by Brands') responseData.brands = section;
            else if (section.sectionType === 'New Arrivals') {
                section.data = formatProducts(section.data, false);
                responseData.newArrivals = section;
            }
            else if (section.sectionType === 'Popular Recipes') responseData.popularRecipes = section;
            else if (section.sectionType === 'Testimonials') responseData.testimonials = section;
            else if (section.sectionType === 'Why Choose Us') responseData.whyChooseUs = section;
            else if (section.sectionType === 'Offer Banners') responseData.offers = section;
        });

        res.status(200).json(new ApiResponse(200, responseData, 'Homepage retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
