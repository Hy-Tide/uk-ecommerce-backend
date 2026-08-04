const User = require('../../models/user.model');
const AuthService = require('../../services/auth.service');
const EmailService = require('../../services/email.service');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

// Helper to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, phone_number } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ApiError(400, 'Email already in use'));
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password,
            phone_number,
            otp,
            otpExpires
        });

        // Send OTP email
        try {
            await EmailService.sendEmail({
                to: newUser.email,
                subject: 'Verify your Email - Grandmas Basket',
                text: `Your OTP for email verification is ${otp}. It is valid for 10 minutes.`,
                html: `<p>Your OTP for email verification is <b>${otp}</b>.</p><p>It is valid for 10 minutes.</p>`
            });
        } catch (error) {
            console.error('Error sending OTP email:', error);
        }

        const tokens = AuthService.generateTokens(newUser, 'user');

        res.status(201).json(new ApiResponse(201, {
            user: {
                id: newUser._id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                email: newUser.email,
                isEmailVerified: newUser.isEmailVerified
            },
            tokens
        }, 'User registered successfully. Please verify your email with the OTP sent.'));
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

        if (!user.isEmailVerified) {
            return next(new ApiError(403, 'Please verify your email before logging in'));
        }

        user.last_login = Date.now();
        await user.save({ validateBeforeSave: false });

        const tokens = AuthService.generateTokens(user, 'user');

        res.status(200).json(new ApiResponse(200, {
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                isEmailVerified: user.isEmailVerified
            },
            tokens
        }, 'Login successful'));
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
    } catch (error) {
        next(error);
    }
};

exports.verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return next(new ApiError(400, 'Please provide email and OTP'));
        }

        const user = await User.findOne({ email, otp, otpExpires: { $gt: Date.now() } });
        if (!user) {
            return next(new ApiError(400, 'Invalid or expired OTP'));
        }

        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.status(200).json(new ApiResponse(200, null, 'Email verified successfully'));
    } catch (error) {
        next(error);
    }
};

exports.resendOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(new ApiError(400, 'Please provide email'));
        }

        const user = await User.findOne({ email });
        if (!user) {
            return next(new ApiError(404, 'User not found'));
        }

        if (user.isEmailVerified) {
            return next(new ApiError(400, 'Email is already verified'));
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        try {
            await EmailService.sendEmail({
                to: user.email,
                subject: 'Resend OTP - Grandmas Basket',
                text: `Your OTP for email verification is ${otp}. It is valid for 10 minutes.`,
                html: `<p>Your OTP for email verification is <b>${otp}</b>.</p><p>It is valid for 10 minutes.</p>`
            });
        } catch (error) {
            console.error('Error sending OTP email:', error);
            return next(new ApiError(500, 'Error sending email'));
        }

        res.status(200).json(new ApiResponse(200, null, 'OTP sent successfully'));
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return next(new ApiError(400, 'Please provide email'));
        }

        const user = await User.findOne({ email });
        if (!user) {
            return next(new ApiError(404, 'User with this email not found'));
        }

        const resetToken = generateOTP();
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
        await user.save({ validateBeforeSave: false });

        try {
            await EmailService.sendEmail({
                to: user.email,
                subject: 'Password Reset - Grandmas Basket',
                text: `Your OTP for password reset is ${resetToken}. It is valid for 15 minutes.`,
                html: `<p>Your OTP for password reset is <b>${resetToken}</b>.</p><p>It is valid for 15 minutes.</p>`
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });
            console.error('Error sending password reset email:', error);
            return next(new ApiError(500, 'Error sending email'));
        }

        res.status(200).json(new ApiResponse(200, null, 'Password reset OTP sent to email'));
    } catch (error) {
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, otp, password } = req.body;
        if (!email || !otp || !password) {
            return next(new ApiError(400, 'Please provide email, OTP, and new password'));
        }

        const user = await User.findOne({ 
            email, 
            resetPasswordToken: otp, 
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) {
            return next(new ApiError(400, 'Invalid or expired OTP'));
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save(); // This will trigger pre-save hook to hash password

        res.status(200).json(new ApiResponse(200, null, 'Password has been reset successfully'));
    } catch (error) {
        next(error);
    }
};
