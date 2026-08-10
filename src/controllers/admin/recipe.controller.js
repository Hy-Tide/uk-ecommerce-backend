const Recipe = require('../../models/recipe.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

exports.createRecipe = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new ApiError(400, 'Validation Error', errors.array()));
        }

        const {
            title,
            description,
            ingredients,
            products,
            instructions,
            is_active
        } = req.body;

        let image_url = req.body.image_url;
        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            image_url = `${baseUrl}/uploads/${req.file.filename}`;
        }

        const recipe = await Recipe.create({
            title,
            description,
            image_url,
            ingredients,
            products,
            instructions,
            is_active
        });
        
        res.status(201).json(new ApiResponse(201, { recipe }, 'Recipe created successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getAllRecipes = async (req, res, next) => {
    try {
        const { search, page = 1, limit = 10, status, ingredient } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        
        if (status) {
            query.is_active = status === 'active';
        }

        if (ingredient) {
            query.ingredients = ingredient;
        }

        const skip = (page - 1) * limit;

        const recipes = await Recipe.find(query).select('-description -ingredients -instructions').populate('cuisine', 'name image').populate('products').skip(skip).limit(parseInt(limit)).sort('-createdAt');
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
        const recipe = await Recipe.findById(req.params.id).populate('cuisine', 'name image').populate('products');
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

        const {
            title,
            description,
            image_url,
            ingredients,
            products,
            instructions,
            is_active
        } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (image_url !== undefined) updateData.image_url = image_url;
        if (ingredients !== undefined) updateData.ingredients = ingredients;
        if (products !== undefined) updateData.products = products;
        if (instructions !== undefined) updateData.instructions = instructions;
        if (is_active !== undefined) updateData.is_active = is_active;

        if (req.file) {
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            updateData.image_url = `${baseUrl}/uploads/${req.file.filename}`;
            
            const recipeForOldImage = await Recipe.findById(req.params.id);
            if (recipeForOldImage) {
                const oldImage = recipeForOldImage.image_url;
                if (oldImage && oldImage.includes('/uploads/')) {
                    const oldFilename = oldImage.split('/uploads/')[1];
                    const oldFilePath = path.join(__dirname, '../../../uploads', oldFilename);
                    if (fs.existsSync(oldFilePath)) {
                        fs.unlinkSync(oldFilePath);
                    }
                }
            }
        }

        const recipe = await Recipe.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
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

exports.getRecipeIngredients = async (req, res, next) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return next(new ApiError(404, 'Recipe not found'));
        }
        res.status(200).json(new ApiResponse(200, { ingredients: recipe.ingredients || [] }, 'Ingredients retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.addIngredients = async (req, res, next) => {
    try {
        const { ingredients } = req.body;
        if (!ingredients || !Array.isArray(ingredients)) {
            return next(new ApiError(400, 'ingredients array is required'));
        }
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return next(new ApiError(404, 'Recipe not found'));
        }
        
        recipe.ingredients = [...(recipe.ingredients || []), ...ingredients];
        await recipe.save();
        
        res.status(200).json(new ApiResponse(200, { ingredients: recipe.ingredients }, 'Ingredients added successfully'));
    } catch (error) {
        next(error);
    }
};

exports.replaceIngredients = async (req, res, next) => {
    try {
        const { ingredients } = req.body;
        if (!ingredients || !Array.isArray(ingredients)) {
            return next(new ApiError(400, 'ingredients array is required'));
        }
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return next(new ApiError(404, 'Recipe not found'));
        }
        
        recipe.ingredients = ingredients;
        await recipe.save();
        
        res.status(200).json(new ApiResponse(200, { ingredients: recipe.ingredients }, 'Ingredients replaced successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteIngredient = async (req, res, next) => {
    try {
        const index = parseInt(req.params.index);
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return next(new ApiError(404, 'Recipe not found'));
        }
        
        if (isNaN(index) || index < 0 || index >= (recipe.ingredients || []).length) {
            return next(new ApiError(400, 'Invalid ingredient index'));
        }
        
        recipe.ingredients.splice(index, 1);
        await recipe.save();
        
        res.status(200).json(new ApiResponse(200, { ingredients: recipe.ingredients }, 'Ingredient deleted successfully'));
    } catch (error) {
        next(error);
    }
};
