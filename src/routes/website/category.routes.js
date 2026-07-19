const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/website/category.controller');

/**
 * @swagger
 * tags:
 *   name: Website Categories
 *   description: Category fetching for customers
 */

/**
 * @swagger
 * /website/categories:
 *   get:
 *     summary: Get all active categories
 *     tags: [Website Categories]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/', categoryController.getActiveCategories);

/**
 * @swagger
 * /website/categories/{slug}:
 *   get:
 *     summary: Get a single active category by slug
 *     tags: [Website Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found or inactive
 */
router.get('/:slug', categoryController.getCategoryBySlug);

module.exports = router;
