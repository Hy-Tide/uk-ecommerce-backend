const express = require('express');
const router = express.Router();
const brandController = require('../../controllers/website/brand.controller');

/**
 * @swagger
 * tags:
 *   name: Website Brands
 *   description: Brand fetching for customers
 */

/**
 * @swagger
 * /website/brands:
 *   get:
 *     summary: Get all active brands
 *     tags: [Website Brands]
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 */
router.get('/', brandController.getActiveBrands);

/**
 * @swagger
 * /website/brands/{slug}:
 *   get:
 *     summary: Get a single active brand by slug
 *     tags: [Website Brands]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand retrieved successfully
 *       404:
 *         description: Brand not found or inactive
 */
router.get('/:slug', brandController.getBrandBySlug);

module.exports = router;
