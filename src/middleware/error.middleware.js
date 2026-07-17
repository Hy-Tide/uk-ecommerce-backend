const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    let error = err;

    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || error instanceof Error ? 400 : 500;
        const message = error.message || 'Something went wrong';
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    const response = {
        success: false,
        message: error.message,
        errors: error.errors,
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack } : {})
    };

    logger.error(`${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

    return res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
