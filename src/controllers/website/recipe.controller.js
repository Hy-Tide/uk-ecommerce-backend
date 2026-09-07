const Recipe = require('../../models/recipe.model');
const Cuisine = require('../../models/cuisine.model');
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

exports.getSeasonalRecipes = async (req, res, next) => {
    try {
        // Mocking seasonal collections since there's no model for it yet
        const collections = [
            { id: 1, title: 'Diwali Specials', subtitle: 'Festive Treats', img: '/images/recipes/diwali.jpg', color: 'from-orange-600/80 to-red-900/90' },
            { id: 2, title: 'Winter Comforts', subtitle: 'Warm & Cozy', img: '/images/recipes/winter.jpg', color: 'from-blue-600/80 to-purple-900/90' },
            { id: 3, title: 'Summer Refreshers', subtitle: 'Cooling Drinks', img: '/images/recipes/summer.jpg', color: 'from-yellow-500/80 to-orange-700/90' },
            { id: 4, title: 'Monsoon Cravings', subtitle: 'Fried Delights', img: '/images/recipes/monsoon.jpg', color: 'from-teal-600/80 to-green-900/90' }
        ];

        res.status(200).json(new ApiResponse(200, { collections }, 'Seasonal collections retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getRecipeCuisines = async (req, res, next) => {
    try {
        const cuisines = await Cuisine.find({ isActive: true }).select('name description image');
        res.status(200).json(new ApiResponse(200, { cuisines }, 'Cuisines retrieved successfully'));
    } catch (error) {
        next(error);
    }
};
