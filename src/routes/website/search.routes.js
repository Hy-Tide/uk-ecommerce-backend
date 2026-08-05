const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/website/search.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Website Search
 *   description: Global search suggestions and logging
 */

/**
 * @swagger
 * /website/search/suggestions:
 *   get:
 *     summary: Get fast autocomplete suggestions across products, categories, and brands
 *     tags: [Website Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (minimum 2 characters)
 *     responses:
 *       200:
 *         description: Suggestions retrieved successfully
 */
router.get('/suggestions', searchController.getSuggestions);

/**
 * @swagger
 * /website/search/log:
 *   post:
 *     summary: Log a user search for analytics
 *     tags: [Website Search]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *               resultsCount:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Search logged successfully
 */
// We use a custom middleware step to extract user if token exists but not fail if guest
router.post('/log', (req, res, next) => {
    // If authorization header exists, protectWebsite will attach user, else skip
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return authMiddleware.protectWebsite(req, res, next);
    }
    next();
}, searchController.logSearch);

module.exports = router;
