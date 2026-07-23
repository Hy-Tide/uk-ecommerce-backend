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

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
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
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Import routes
const websiteAuthRoutes = require('./routes/website/auth.routes');
const websiteUserRoutes = require('./routes/website/user.routes');
const websiteCategoryRoutes = require('./routes/website/category.routes');
const websiteBrandRoutes = require('./routes/website/brand.routes');
const websiteSubCategoryRoutes = require('./routes/website/sub_category.routes');
const websiteProductRoutes = require('./routes/website/product.routes');

const adminAuthRoutes = require('./routes/admin/auth.routes');
const adminCategoryRoutes = require('./routes/admin/category.routes');
const adminBrandRoutes = require('./routes/admin/brand.routes');
const adminSubCategoryRoutes = require('./routes/admin/sub_category.routes');
const adminProductRoutes = require('./routes/admin/product.routes');
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

app.use(`${API_PREFIX}/admin/auth`, adminAuthRoutes);
app.use(`${API_PREFIX}/admin/categories`, adminCategoryRoutes);
app.use(`${API_PREFIX}/admin/brands`, adminBrandRoutes);
app.use(`${API_PREFIX}/admin/subcategories`, adminSubCategoryRoutes);
app.use(`${API_PREFIX}/admin/products`, adminProductRoutes);

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
