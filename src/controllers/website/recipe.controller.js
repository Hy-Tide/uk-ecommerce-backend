const Recipe = require('../../models/recipe.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getRecipes = async (req, res, next) => {
    try {
        const { search, cuisineId, ingredient, page = 1, limit = 10 } = req.query;
        let query = { is_active: true };

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { title: regex },
                { description: regex },
                { ingredients: regex }
            ];
        }

        if (cuisineId) {
            query.cuisine = cuisineId;
        }

        if (ingredient) {
            query.ingredients = ingredient;
        }

        const skip = (page - 1) * limit;

        const recipes = await Recipe.find(query)
            .select('-description -ingredients -instructions')
            .populate('cuisine', 'name image')
            .populate('products')
            .skip(skip)
            .limit(parseInt(limit))
            .sort('-createdAt');

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
        const recipe = await Recipe.findOne({ _id: req.params.id, is_active: true })
            .populate('cuisine', 'name image')
            .populate('products');
        if (!recipe) {
            return next(new ApiError(404, 'Recipe not found'));
        }
        res.status(200).json(new ApiResponse(200, { recipe }, 'Recipe retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
