const User = require('../../models/user.model');
const AuthService = require('../../services/auth.service');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, phone_number } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ApiError(400, 'Email already in use'));
        }

        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password,
            phone_number
        });

        const tokens = AuthService.generateTokens(newUser, 'user');

        res.status(201).json(new ApiResponse(201, {
            user: {
                id: newUser._id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email
            },
            tokens
        }, 'User registered successfully'));
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ApiError(400, 'Please provide email and password'));
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new ApiError(401, 'Incorrect email or password'));
        }

        if (!user.is_active) {
            return next(new ApiError(403, 'Your account has been deactivated'));
        }

        user.last_login = Date.now();
        await user.save({ validateBeforeSave: false });

        const tokens = AuthService.generateTokens(user, 'user');

        res.status(200).json(new ApiResponse(200, {
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            },
            tokens
        }, 'Login successful'));
    } catch (error) {
        next(error);
    }
};
