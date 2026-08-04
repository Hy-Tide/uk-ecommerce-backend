const AdminUser = require('../../models/admin_user.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await AdminUser.find().select('-password');
        res.status(200).json(new ApiResponse(200, users, 'Admin users retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getUserById = async (req, res, next) => {
    try {
        const user = await AdminUser.findById(req.params.id).select('-password');
        if (!user) {
            return next(new ApiError(404, 'Admin user not found'));
        }
        res.status(200).json(new ApiResponse(200, user, 'Admin user retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, status, role_id } = req.body;
        
        // Prevent password update through this route
        if (req.body.password) {
            return next(new ApiError(400, 'Cannot update password through this route'));
        }

        const user = await AdminUser.findByIdAndUpdate(
            req.params.id,
            { name, email, status, role_id },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return next(new ApiError(404, 'Admin user not found'));
        }

        res.status(200).json(new ApiResponse(200, user, 'Admin user updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await AdminUser.findByIdAndDelete(req.params.id);
        
        if (!user) {
            return next(new ApiError(404, 'Admin user not found'));
        }

        res.status(200).json(new ApiResponse(200, null, 'Admin user deleted successfully'));
    } catch (error) {
        next(error);
    }
};
