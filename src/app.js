const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const path = require('path');

const requestLogger = require('./middleware/logger.middleware');
const errorHandler = require('./middleware/error.middleware');
const ApiError = require('./utils/ApiError');
const ApiResponse = require('./utils/ApiResponse');
const constants = require('./constants');

const app = express();

// Set security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors({
    origin: function (origin, callback) {
        // Allow all origins
        callback(null, true);
    },
    credentials: true
}));

// Request logger
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Payment Webhook (must be parsed as raw body before express.json is applied)
const websitePaymentController = require('./controllers/website/payment.controller');
app.post('/api/v1/website/payments/webhook', express.raw({ type: 'application/json' }), websitePaymentController.webhook);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
// app.use(mongoSanitize());

// Data sanitization against XSS
// app.use(xss()); // Causes "Cannot set property query" error in Express 5

// Prevent parameter pollution
// app.use(hpp()); // Causes "Cannot set property query" error in Express 5

// Compression
app.use(compression());

// Serving static files
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/upload', express.static(path.join(__dirname, '../upload')));

// Import routes
const websiteAuthRoutes = require('./routes/website/auth.routes');
const websiteUserRoutes = require('./routes/website/user.routes');
const websiteCategoryRoutes = require('./routes/website/category.routes');
const websiteBrandRoutes = require('./routes/website/brand.routes');
const websiteSubCategoryRoutes = require('./routes/website/sub_category.routes');
const websiteProductRoutes = require('./routes/website/product.routes');
const websiteWishlistRoutes = require('./routes/website/wishlist.routes');
const websiteCartRoutes = require('./routes/website/cart.routes');
const websiteCouponRoutes = require('./routes/website/coupon.routes');
const websiteCheckoutRoutes = require('./routes/website/checkout.routes');
const websiteOrderRoutes = require('./routes/website/order.routes');
const websiteHomeRoutes = require('./routes/website/home.routes');
const websiteOfferRoutes = require('./routes/website/offer.routes');
const websiteRecipeRoutes = require('./routes/website/recipe.routes');
const websiteBlogRoutes = require('./routes/website/blog.routes');
const websiteEnquiryRoutes = require('./routes/website/enquiry.routes');
const websiteNotificationRoutes = require('./routes/website/notification.routes');
const websiteSearchRoutes = require('./routes/website/search.routes');
const websitePaymentRoutes = require('./routes/website/payment.routes');
const websiteBannerRoutes = require('./routes/website/banner.routes');
const websiteNewsletterRoutes = require('./routes/website/newsletter.routes');
const websiteSettingRoutes = require('./routes/website/setting.routes');

const adminAuthRoutes = require('./routes/admin/auth.routes');
const adminCategoryRoutes = require('./routes/admin/category.routes');
const adminBrandRoutes = require('./routes/admin/brand.routes');
const adminSubCategoryRoutes = require('./routes/admin/sub_category.routes');
const adminProductRoutes = require('./routes/admin/product.routes');
const adminCustomerRoutes = require('./routes/admin/customer.routes');
const adminCouponRoutes = require('./routes/admin/coupon.routes');
const adminOrderRoutes = require('./routes/admin/order.routes');
const adminUserRoutes = require('./routes/admin/user.routes');
const adminTestimonialRoutes = require('./routes/admin/testimonial.routes');
const adminRecipeRoutes = require('./routes/admin/recipe.routes');
const adminHomeConfigRoutes = require('./routes/admin/home_configuration.routes');
const adminInventoryRoutes = require('./routes/admin/inventory.routes');
const adminCuisineRoutes = require('./routes/admin/cuisine.routes');
const adminOfferRoutes = require('./routes/admin/offer.routes');
const adminBlogCategoryRoutes = require('./routes/admin/blog_category.routes');
const adminBlogRoutes = require('./routes/admin/blog.routes');
const adminEnquiryRoutes = require('./routes/admin/enquiry.routes');
const adminNotificationRoutes = require('./routes/admin/notification.routes');
const adminSearchRoutes = require('./routes/admin/search.routes');
const adminPaymentRoutes = require('./routes/admin/payment.routes');
const adminDashboardRoutes = require('./routes/admin/dashboard.routes');
const adminReportRoutes = require('./routes/admin/report.routes');
const adminSettingRoutes = require('./routes/admin/setting.routes');
const adminRoleRoutes = require('./routes/admin/role.routes');
const adminAuditLogRoutes = require('./routes/admin/audit_log.routes');
const adminBannerRoutes = require('./routes/admin/banner.routes');
const adminNewsletterRoutes = require('./routes/admin/newsletter.routes');
const swaggerUi = require('swagger-ui-express');
const { websiteSwaggerSpec, adminSwaggerSpec } = require('./config/swagger');

// API Versioning and Routes
const API_PREFIX = '/api/v1';

// Swagger UI
app.get('/api-docs', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/api-docs-index.html'));
});
app.use('/api-docs/website', swaggerUi.serveFiles(websiteSwaggerSpec), swaggerUi.setup(websiteSwaggerSpec));
app.use('/api-docs/admin', swaggerUi.serveFiles(adminSwaggerSpec), swaggerUi.setup(adminSwaggerSpec));

app.use(`${API_PREFIX}/website/auth`, websiteAuthRoutes);
app.use(`${API_PREFIX}/website/users`, websiteUserRoutes);
app.use(`${API_PREFIX}/website/categories`, websiteCategoryRoutes);
app.use(`${API_PREFIX}/website/brands`, websiteBrandRoutes);
app.use(`${API_PREFIX}/website/subcategories`, websiteSubCategoryRoutes);
app.use(`${API_PREFIX}/website/products`, websiteProductRoutes);
app.use(`${API_PREFIX}/website/wishlist`, websiteWishlistRoutes);
app.use(`${API_PREFIX}/website/cart`, websiteCartRoutes);
app.use(`${API_PREFIX}/website/coupons`, websiteCouponRoutes);
app.use(`${API_PREFIX}/website/checkout`, websiteCheckoutRoutes);
app.use(`${API_PREFIX}/website/orders`, websiteOrderRoutes);
app.use(`${API_PREFIX}/website/home`, websiteHomeRoutes);
app.use(`${API_PREFIX}/website/offers`, websiteOfferRoutes);
app.use(`${API_PREFIX}/website/recipes`, websiteRecipeRoutes);
app.use(`${API_PREFIX}/website/blogs`, websiteBlogRoutes);
app.use(`${API_PREFIX}/website/contact`, websiteEnquiryRoutes);
app.use(`${API_PREFIX}/website/notifications`, websiteNotificationRoutes);
app.use(`${API_PREFIX}/website/search`, websiteSearchRoutes);
app.use(`${API_PREFIX}/website/payments`, websitePaymentRoutes);
app.use(`${API_PREFIX}/website/banners`, websiteBannerRoutes);
app.use(`${API_PREFIX}/website/newsletter`, websiteNewsletterRoutes);
app.use(`${API_PREFIX}/website/settings`, websiteSettingRoutes);

app.use(`${API_PREFIX}/admin/auth`, adminAuthRoutes);
app.use(`${API_PREFIX}/admin/categories`, adminCategoryRoutes);
app.use(`${API_PREFIX}/admin/brands`, adminBrandRoutes);
app.use(`${API_PREFIX}/admin/subcategories`, adminSubCategoryRoutes);
app.use(`${API_PREFIX}/admin/products`, adminProductRoutes);
app.use(`${API_PREFIX}/admin/customers`, adminCustomerRoutes);
app.use(`${API_PREFIX}/admin/coupons`, adminCouponRoutes);
app.use(`${API_PREFIX}/admin/orders`, adminOrderRoutes);
app.use(`${API_PREFIX}/admin/users`, adminUserRoutes);
app.use(`${API_PREFIX}/admin/testimonials`, adminTestimonialRoutes);
app.use(`${API_PREFIX}/admin/recipes`, adminRecipeRoutes);
app.use(`${API_PREFIX}/admin/home-config`, adminHomeConfigRoutes);
app.use(`${API_PREFIX}/admin/inventory`, adminInventoryRoutes);
app.use(`${API_PREFIX}/admin/cuisines`, adminCuisineRoutes);
app.use(`${API_PREFIX}/admin/offers`, adminOfferRoutes);
app.use(`${API_PREFIX}/admin/blog-categories`, adminBlogCategoryRoutes);
app.use(`${API_PREFIX}/admin/blogs`, adminBlogRoutes);
app.use(`${API_PREFIX}/admin/enquiries`, adminEnquiryRoutes);
app.use(`${API_PREFIX}/admin/notifications`, adminNotificationRoutes);
app.use(`${API_PREFIX}/admin/search`, adminSearchRoutes);
app.use(`${API_PREFIX}/admin/payments`, adminPaymentRoutes);
app.use(`${API_PREFIX}/admin/dashboard`, adminDashboardRoutes);
app.use(`${API_PREFIX}/admin/reports`, adminReportRoutes);
app.use(`${API_PREFIX}/admin/settings`, adminSettingRoutes);
app.use(`${API_PREFIX}/admin/roles`, adminRoleRoutes);
app.use(`${API_PREFIX}/admin/audit-logs`, adminAuditLogRoutes);
app.use(`${API_PREFIX}/admin/banners`, adminBannerRoutes);
app.use(`${API_PREFIX}/admin/newsletter`, adminNewsletterRoutes);

// Root Route for Render Health Checks    
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "UK Ecommerce Backend API is running successfully."
    });
});

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json(new ApiResponse(200, null, 'API is running successfully'));
});

// 404 Handler
app.use((req, res, next) => {
    next(new ApiError(404, `Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
