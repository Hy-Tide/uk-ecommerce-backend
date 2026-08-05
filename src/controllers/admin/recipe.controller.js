const Recipe = require('../../models/recipe.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');

exports.createRecipe = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const recipe = await Recipe.create(req.body);
        res.status(201).json(new ApiResponse(201, { recipe }, 'Recipe created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllRecipes = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, status } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        
        if (status) {
            query.is_active = status === 'active';
        }

        const skip = (page - 1) * limit;

        const recipes = await Recipe.find(query).populate('cuisine', 'name image').skip(skip).limit(parseInt(limit)).sort('-createdAt');
        const total = await Recipe.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            recipes,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Recipes retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getRecipeById = async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id).populate('cuisine', 'name image');
        if (!recipe) {
            return next(new ApiError(404, 'Recipe not found'));
        }
        res.status(200).json(new ApiResponse(200, { recipe }, 'Recipe retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateRecipe = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!recipe) {
            return next(new ApiError(404, 'Recipe not found'));
        }

        res.status(200).json(new ApiResponse(200, { recipe }, 'Recipe updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteRecipe = async (req, res, next) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);
        if (!recipe) {
            return next(new ApiError(404, 'Recipe not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Recipe deleted successfully'));
    } catch (error) {
        next(error);
    }
};
