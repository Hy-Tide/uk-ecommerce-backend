const express = require('express');
const router = express.Router();
const recipeController = require('../../controllers/website/recipe.controller');

/**
 * @swagger
 * tags:
 *   name: Website Recipes
 *   description: Recipe fetching for customers
 */

router.get('/', recipeController.getRecipes);
router.get('/:id', recipeController.getRecipeById);

module.exports = router;
