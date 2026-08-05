const Cuisine = require('../../models/cuisine.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.createCuisine = async (req, res, next) => {
    try {
        const cuisine = await Cuisine.create(req.body);
        res.status(201).json(new ApiResponse(201, { cuisine }, 'Cuisine created successfully'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'Cuisine name already exists'));
        }
        next(error);
    }
};

exports.getAllCuisines = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, status } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (status !== undefined) {
            query.isActive = status === 'true';
        }

        const skip = (page - 1) * limit;
        const cuisines = await Cuisine.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Cuisine.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            cuisines,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Cuisines retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getCuisineById = async (req, res, next) => {
    try {
        const cuisine = await Cuisine.findById(req.params.id);
        if (!cuisine) {
            return next(new ApiError(404, 'Cuisine not found'));
        }
        res.status(200).json(new ApiResponse(200, { cuisine }, 'Cuisine retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateCuisine = async (req, res, next) => {
    try {
        const cuisine = await Cuisine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!cuisine) {
            return next(new ApiError(404, 'Cuisine not found'));
        }
        res.status(200).json(new ApiResponse(200, { cuisine }, 'Cuisine updated successfully'));
    } catch (error) {
        if (error.code === 11000) {
            return next(new ApiError(400, 'Cuisine name already exists'));
        }
        next(error);
    }
};

exports.deleteCuisine = async (req, res, next) => {
    try {
        const cuisine = await Cuisine.findByIdAndDelete(req.params.id);
        if (!cuisine) {
            return next(new ApiError(404, 'Cuisine not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Cuisine deleted successfully'));
    } catch (error) {
        next(error);
    }
};
