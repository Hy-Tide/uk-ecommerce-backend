const express = require('express');
const router = express.Router();
const offerController = require('../../controllers/admin/offer.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Offers
 *   description: Offer management for admins
 */

router.use(authMiddleware.protectAdmin);

router.route('/')
    .get(offerController.getAllOffers)
    .post(offerController.createOffer);

router.route('/:id')
    .get(offerController.getOfferById)
    .put(offerController.updateOffer)
    .delete(offerController.deleteOffer);

router.patch('/:id/toggle-status', offerController.toggleOfferStatus);

module.exports = router;
