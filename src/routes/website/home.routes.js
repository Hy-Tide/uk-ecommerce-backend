const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/website/home.controller');

/**
 * @swagger
 * tags:
 *   name: Website Home
 *   description: Homepage dynamic content
 */

/**
 * @swagger
 * /website/home:
 *   get:
 *     summary: Get all enabled homepage sections with their resolved data
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Homepage retrieved successfully
 */
router.get('/', homeController.getHomepage);

module.exports = router;
