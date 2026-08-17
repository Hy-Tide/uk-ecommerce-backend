const express = require('express');
const router = express.Router();
const deliveryController = require('../../controllers/website/delivery.controller');

/**
 * @swagger
 * tags:
 *   name: Website Delivery
 *   description: Delivery availability check
 */

/**
 * @swagger
 * /website/delivery/check-availability:
 *   post:
 *     summary: Check delivery availability for a location
 *     tags: [Website Delivery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Delivery availability checked successfully
 *       400:
 *         description: Latitude and longitude are required
 */
router.post('/check-availability', deliveryController.checkAvailability);

module.exports = router;
