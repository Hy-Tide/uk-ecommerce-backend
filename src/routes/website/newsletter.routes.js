const express = require('express');
const router = express.Router();
const newsletterController = require('../../controllers/website/newsletter.controller');

/**
 * @swagger
 * tags:
 *   name: Website Newsletter
 *   description: Newsletter subscription
 */

/**
 * @swagger
 * /website/newsletter/subscribe:
 *   post:
 *     summary: Subscribe to newsletter
 *     tags: [Website Newsletter]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subscribed successfully
 *       400:
 *         description: Bad request
 */
router.post('/subscribe', newsletterController.subscribe);

module.exports = router;
