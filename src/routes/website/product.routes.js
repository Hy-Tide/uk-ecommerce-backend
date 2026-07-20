const express = require('express');
const router = express.Router();
const productController = require('../../controllers/website/product.controller');

/**
 * @swagger
 * tags:
 *   name: Website Products
 *   description: Product fetching for customers
 */

/**
 * @swagger
 * /website/products:
 *   get:
 *     summary: Get all active products
 *     tags: [Website Products]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: sub_category_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand_id
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
 *         name: sort
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', productController.getProducts);

/**
 * @swagger
 * /website/products/{slug}:
 *   get:
 *     summary: Get a single active product by slug
 *     tags: [Website Products]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *       404:
 *         description: Product not found or inactive
 */
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
