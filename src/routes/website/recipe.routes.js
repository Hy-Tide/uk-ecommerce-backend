const express = require('express');
const router = express.Router();
const recipeController = require('../../controllers/website/recipe.controller');

/**
 * @swagger
 * tags:
 *   name: Website Recipes
 *   description: Recipe fetching for customers
 */

/**
 * @swagger
 * /website/recipes:
 *   get:
 *     summary: Get all active recipes
 *     tags: [Website Recipes]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: cuisineId
 *         schema:
 *           type: string
 *       - in: query
 *         name: ingredient
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipes retrieved successfully
 */
router.get('/', recipeController.getRecipes);

/**
 * @swagger
 * /website/recipes/{id}:
 *   get:
 *     summary: Get recipe details by ID
 *     tags: [Website Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe retrieved successfully
 */
router.get('/:id', recipeController.getRecipeById);

module.exports = router;
