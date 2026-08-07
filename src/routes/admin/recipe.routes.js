const express = require('express');
const router = express.Router();
const recipeController = require('../../controllers/admin/recipe.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { recipeValidator } = require('../../validators/recipe.validator');

/**
 * @swagger
 * tags:
 *   name: Admin Recipes
 *   description: Recipe management for admins
 */

/**
 * @swagger
 * /admin/recipes:
 *   post:
 *     summary: Create a new recipe
 *     tags: [Admin Recipes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               instructions:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *   get:
 *     summary: Get all recipes
 *     tags: [Admin Recipes]
 *     parameters:
 *       - in: query
 *         name: search
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipes retrieved successfully
 */
router.route('/')
    .post(authMiddleware.protectAdmin, recipeValidator, recipeController.createRecipe)
    .get(recipeController.getAllRecipes);

/**
 * @swagger
 * /admin/recipes/{id}:
 *   get:
 *     summary: Get a single recipe by ID
 *     tags: [Admin Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe retrieved successfully
 *   put:
 *     summary: Update a recipe by ID
 *     tags: [Admin Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               instructions:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *   delete:
 *     summary: Delete a recipe by ID
 *     tags: [Admin Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 */
router.route('/:id')
    .get(recipeController.getRecipeById)
    .put(authMiddleware.protectAdmin, recipeValidator, recipeController.updateRecipe)
    .delete(authMiddleware.protectAdmin, recipeController.deleteRecipe);

/**
 * @swagger
 * /admin/recipes/{id}/ingredients:
 *   get:
 *     summary: Get ingredients for a recipe
 *     tags: [Admin Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ingredients retrieved successfully
 *   post:
 *     summary: Add ingredients to a recipe
 *     tags: [Admin Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ingredients
 *             properties:
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Ingredients added successfully
 *   put:
 *     summary: Replace all ingredients for a recipe
 *     tags: [Admin Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ingredients
 *             properties:
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Ingredients replaced successfully
 */
router.route('/:id/ingredients')
    .get(recipeController.getRecipeIngredients)
    .post(authMiddleware.protectAdmin, recipeController.addIngredients)
    .put(authMiddleware.protectAdmin, recipeController.replaceIngredients);

/**
 * @swagger
 * /admin/recipes/{id}/ingredients/{index}:
 *   delete:
 *     summary: Delete a specific ingredient by index
 *     tags: [Admin Recipes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ingredient deleted successfully
 */
router.delete('/:id/ingredients/:index', authMiddleware.protectAdmin, recipeController.deleteIngredient);

module.exports = router;
