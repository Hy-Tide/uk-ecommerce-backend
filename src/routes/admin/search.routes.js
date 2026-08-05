const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/admin/search.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Search
 *   description: Search analytics and management for admins
 */

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * /admin/search/analytics:
 *   get:
 *     summary: Get search analytics
 *     tags: [Admin Search]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Search analytics retrieved successfully
 */
router.get('/analytics', searchController.getAnalytics);

/**
 * @swagger
 * /admin/search/top:
 *   get:
 *     summary: Get top searched terms
 *     tags: [Admin Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Top searches retrieved successfully
 */
router.get('/top', searchController.getTopSearches);

module.exports = router;
