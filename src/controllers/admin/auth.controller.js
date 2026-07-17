const AdminUser = require('../../models/admin_user.model');
const AuthService = require('../../services/auth.service');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ApiError(400, 'Please provide email and password'));
        }

        const user = await AdminUser.findOne({ email }).select('+password');
        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new ApiError(401, 'Incorrect email or password'));
        }

        if (user.status !== 'active') {
            return next(new ApiError(403, 'Your admin account is inactive. Please contact support.'));
        }

        user.last_login = Date.now();
        await user.save({ validateBeforeSave: false });

        const tokens = AuthService.generateTokens(user, 'admin');

        res.status(200).json(new ApiResponse(200, {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role_id: user.role_id
            },
            tokens
        }, 'Admin login successful'));
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await AdminUser.findOne({ email });
        if (existingUser) {
            return next(new ApiError(400, 'Email already in use'));
        }

        const newUser = await AdminUser.create({
            name,
            email,
            password,
            // role_id: req.body.role_id // Will be required once roles are implemented
        });

        res.status(201).json(new ApiResponse(201, {
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            }
        }, 'Admin user created successfully'));
    } catch (error) {
        next(error);
    }
};
