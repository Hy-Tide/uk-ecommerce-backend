const Cuisine = require('../../models/cuisine.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const fs = require('fs');
const path = require('path');

exports.createCuisine = async (req, res, next) => {
    try {
        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            req.body.image = `${baseUrl}/uploads/${req.file.filename}`;
        }
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
        const cuisine = await Cuisine.findById(req.params.id);
        if (!cuisine) {
            return next(new ApiError(404, 'Cuisine not found'));
        }

        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            req.body.image = `${baseUrl}/uploads/${req.file.filename}`;
            
            const oldImage = cuisine.image;
            if (oldImage && oldImage.includes('/uploads/')) {
                const oldFilename = oldImage.split('/uploads/')[1];
                const oldFilePath = path.join(__dirname, '../../../uploads', oldFilename);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
        }

        Object.assign(cuisine, req.body);
        await cuisine.save();
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
