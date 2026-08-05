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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: subCategory
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
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
 *           enum: [name, -name, price, -price, displayOrder, newest]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/', productController.getProducts);

router.get('/featured', productController.getFeaturedProducts);
router.get('/best-selling', productController.getBestSellingProducts);
router.get('/new-arrivals', productController.getNewArrivalsProducts);
router.post('/recently-viewed', productController.getRecentlyViewedProducts);
router.get('/:slug/related', productController.getRelatedProducts);

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

/**
 * @swagger
 * /website/products/category/{categoryId}:
 *   get:
 *     summary: Get products by category
 *     tags: [Website Products]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
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
 *           enum: [name, -name, price, -price, displayOrder, newest]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/category/:categoryId', productController.getProductsByCategory);

/**
 * @swagger
 * /website/products/subcategory/{subCategoryId}:
 *   get:
 *     summary: Get products by sub-category
 *     tags: [Website Products]
 *     parameters:
 *       - in: path
 *         name: subCategoryId
 *         required: true
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
 *           enum: [name, -name, price, -price, displayOrder, newest]
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/subcategory/:subCategoryId', productController.getProductsBySubCategory);

module.exports = router;
