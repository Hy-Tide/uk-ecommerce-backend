const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AdminUser = require('../models/admin_user.model');
const ApiError = require('../utils/ApiError');
const jwtConfig = require('../config/jwt');

exports.protectWebsite = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new ApiError(401, 'You are not logged in! Please log in to get access.'));
        }

        const decoded = jwt.verify(token, jwtConfig.secret);
        
        if (decoded.type !== 'user') {
            return next(new ApiError(403, 'Access denied. You are not a customer.'));
        }

        const currentUser = await User.findById(decoded.id);
        if (!currentUser || !currentUser.is_active) {
            return next(new ApiError(401, 'The user belonging to this token does no longer exist or is inactive.'));
        }

        req.user = currentUser;
        next();
    } catch (error) {
        return next(new ApiError(401, 'Invalid or expired token'));
    }
};

exports.protectAdmin = async (req, res, next) => {
    const unauthorizedResponse = {
        success: false,
        message: 'Unauthorized. Please login to continue.'
    };

    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json(unauthorizedResponse);
        }

        const decoded = jwt.verify(token, jwtConfig.secret);
        
        if (decoded.type !== 'admin') {
            return res.status(401).json(unauthorizedResponse);
        }

        const currentAdmin = await AdminUser.findById(decoded.id);
        if (!currentAdmin || currentAdmin.status !== 'active') {
            return res.status(401).json(unauthorizedResponse);
        }

        // Store user in request (backend equivalent of passing session data to next controller)
        req.user = currentAdmin;
        next();
    } catch (error) {
        // Catch invalid or expired token errors from jwt.verify
        return res.status(401).json(unauthorizedResponse);
    }
};
