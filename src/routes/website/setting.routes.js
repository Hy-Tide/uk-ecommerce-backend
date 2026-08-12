const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/website/setting.controller');

/**
 * @swagger
 * tags:
 *   name: Website Settings
 *   description: Global website settings
 */

/**
 * @swagger
 * /website/settings:
 *   get:
 *     summary: Get public website settings
 *     tags: [Website Settings]
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 */
router.get('/', settingController.getSettings);

module.exports = router;
