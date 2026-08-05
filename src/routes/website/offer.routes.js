const express = require('express');
const router = express.Router();
const offerController = require('../../controllers/website/offer.controller');

/**
 * @swagger
 * tags:
 *   name: Website Offers
 *   description: Offer fetching for customers
 */

router.get('/', offerController.getOffers);
router.get('/:id/products', offerController.getOfferProducts);

module.exports = router;
