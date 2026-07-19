const User = require('../../models/user.model');
const Address = require('../../models/address.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

// --- Profile Management ---

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return next(new ApiError(404, 'User not found'));
        
        res.status(200).json(new ApiResponse(200, { user }, 'User profile retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const { first_name, last_name, phone_number } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { first_name, last_name, phone_number },
            { new: true, runValidators: true }
        );

        res.status(200).json(new ApiResponse(200, { user: updatedUser }, 'Profile updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const { oldPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id).select('+password');
        
        if (!(await user.correctPassword(oldPassword, user.password))) {
            return next(new ApiError(401, 'Incorrect current password'));
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json(new ApiResponse(200, null, 'Password updated successfully'));
    } catch (error) {
        next(error);
    }
};

// --- Address Management ---

exports.getAddresses = async (req, res, next) => {
    try {
        const addresses = await Address.find({ user_id: req.user.id });
        res.status(200).json(new ApiResponse(200, { addresses }, 'Addresses retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.addAddress = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        // If this is the first address or marked as default, unset other defaults
        const addressCount = await Address.countDocuments({ user_id: req.user.id });
        let is_default = req.body.is_default || false;
        
        if (addressCount === 0) {
            is_default = true;
        } else if (is_default) {
            await Address.updateMany({ user_id: req.user.id }, { is_default: false });
        }

        const newAddress = await Address.create({
            ...req.body,
            user_id: req.user.id,
            is_default
        });

        res.status(201).json(new ApiResponse(201, { address: newAddress }, 'Address added successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateAddress = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const { id } = req.params;
        const address = await Address.findOne({ _id: id, user_id: req.user.id });
        
        if (!address) return next(new ApiError(404, 'Address not found'));

        if (req.body.is_default) {
            await Address.updateMany({ user_id: req.user.id }, { is_default: false });
        }

        const updatedAddress = await Address.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        
        res.status(200).json(new ApiResponse(200, { address: updatedAddress }, 'Address updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const address = await Address.findOneAndDelete({ _id: id, user_id: req.user.id });
        
        if (!address) return next(new ApiError(404, 'Address not found'));
        
        res.status(200).json(new ApiResponse(200, null, 'Address deleted successfully'));
    } catch (error) {
        next(error);
    }
};
