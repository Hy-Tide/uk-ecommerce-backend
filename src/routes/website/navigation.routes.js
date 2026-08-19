const express = require('express');
const router = express.Router();
const navigationController = require('../../controllers/website/navigation.controller');

/**
 * @swagger
 * tags:
 *   name: Website Navigation
 *   description: Dynamic navigation and mega menu data fetching
 */

/**
 * @swagger
 * /website/navigation:
 *   get:
 *     summary: Get all data required for the navigation bar and mega menu
 *     tags: [Website Navigation]
 *     responses:
 *       200:
 *         description: Navigation data retrieved successfully
 */
router.get('/', navigationController.getNavigationData);

module.exports = router;

