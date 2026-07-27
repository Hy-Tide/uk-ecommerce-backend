const User = require('../../models/user.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

const mapCustomer = (customer) => ({
    _id: customer._id,
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    phone_number: customer.phone_number,
    is_active: customer.is_active,
    status: customer.status,
    is_blocked: customer.is_blocked,
    last_login: customer.last_login,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt
});

exports.getAllCustomers = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, status, is_blocked } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { first_name: { $regex: search, $options: 'i' } },
                { last_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            if (status.toLowerCase() === 'active') {
                query.status = 'Active';
            } else if (status.toLowerCase() === 'inactive') {
                query.status = 'Inactive';
            }
        }

        if (is_blocked !== undefined) {
            query.is_blocked = is_blocked === 'true';
        }

        const skip = (page - 1) * limit;

        const customers = await User.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
        const total = await User.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            customers: customers.map(mapCustomer),
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Customers retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getCustomerById = async (req, res, next) => {
    try {
        const customer = await User.findById(req.params.id);
        if (!customer) {
            return next(new ApiError(404, 'Customer not found'));
        }
        res.status(200).json(new ApiResponse(200, { customer: mapCustomer(customer) }, 'Customer retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateCustomer = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const data = req.body;

        if (data.email) {
            const existingUser = await User.findOne({ email: data.email, _id: { $ne: req.params.id } });
            if (existingUser) {
                return next(new ApiError(409, 'Customer with this email already exists'));
            }
        }

        const customer = await User.findById(req.params.id);
        if (!customer) {
            return next(new ApiError(404, 'Customer not found'));
        }

        // Only allow specific fields to be updated
        const allowedFields = ['first_name', 'last_name', 'email', 'phone_number'];
        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                customer[field] = data[field];
            }
        });

        await customer.save();

        res.status(200).json(new ApiResponse(200, { customer: mapCustomer(customer) }, 'Customer updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateCustomerStatus = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const { status } = req.body;
        
        const customer = await User.findById(req.params.id);
        if (!customer) {
            return next(new ApiError(404, 'Customer not found'));
        }

        customer.status = status;
        customer.is_active = status === 'Active';
        await customer.save();

        res.status(200).json(new ApiResponse(200, { customer: mapCustomer(customer) }, 'Customer status updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.blockCustomer = async (req, res, next) => {
    try {
        const customer = await User.findById(req.params.id);
        if (!customer) {
            return next(new ApiError(404, 'Customer not found'));
        }

        customer.is_blocked = true;
        await customer.save();

        res.status(200).json(new ApiResponse(200, { customer: mapCustomer(customer) }, 'Customer blocked successfully'));
    } catch (error) {
        next(error);
    }
};

exports.unblockCustomer = async (req, res, next) => {
    try {
        const customer = await User.findById(req.params.id);
        if (!customer) {
            return next(new ApiError(404, 'Customer not found'));
        }

        customer.is_blocked = false;
        await customer.save();

        res.status(200).json(new ApiResponse(200, { customer: mapCustomer(customer) }, 'Customer unblocked successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteCustomer = async (req, res, next) => {
    try {
        const customer = await User.findByIdAndDelete(req.params.id);
        if (!customer) {
            return next(new ApiError(404, 'Customer not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Customer deleted successfully'));
    } catch (error) {
        next(error);
    }
};
