const express = require('express');
const router = express.Router();
const subCategoryController = require('../../controllers/website/sub_category.controller');

/**
 * @swagger
 * tags:
 *   name: Website SubCategories
 *   description: SubCategory fetching for customers
 */

/**
 * @swagger
 * /website/subcategories/category/{categorySlug}:
 *   get:
 *     summary: Get all active subcategories for a given category
 *     tags: [Website SubCategories]
 *     parameters:
 *       - in: path
 *         name: categorySlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: SubCategories retrieved successfully
 */
router.get('/category/:categorySlug', subCategoryController.getSubCategoriesByCategory);

module.exports = router;
