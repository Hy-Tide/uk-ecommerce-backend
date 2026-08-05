const express = require('express');
const router = express.Router();
const offerController = require('../../controllers/website/offer.controller');

/**
 * @swagger
 * tags:
 *   name: Website Offers
 *   description: Offer fetching for customers
 */

/**
 * @swagger
 * /website/offers:
 *   get:
 *     summary: Get all active offers
 *     tags: [Website Offers]
 *     responses:
 *       200:
 *         description: Offers retrieved successfully
 */
router.get('/', offerController.getOffers);

/**
 * @swagger
 * /website/offers/{id}/products:
 *   get:
 *     summary: Get products for a specific offer
 *     tags: [Website Offers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer products retrieved successfully
 */
router.get('/:id/products', offerController.getOfferProducts);

module.exports = router;
