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

/**
 * @swagger
 * /admin/offers:
 *   get:
 *     summary: Get all offers
 *     tags: [Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Offers retrieved successfully
 *   post:
 *     summary: Create a new offer
 *     tags: [Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               bannerImage:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Offer created successfully
 */
router.route('/')
    .get(offerController.getAllOffers)
    .post(offerController.createOffer);

/**
 * @swagger
 * /admin/offers/{id}:
 *   get:
 *     summary: Get offer by ID
 *     tags: [Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer retrieved successfully
 *   put:
 *     summary: Update an offer
 *     tags: [Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               bannerImage:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Offer updated successfully
 *   delete:
 *     summary: Delete an offer
 *     tags: [Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer deleted successfully
 */
router.route('/:id')
    .get(offerController.getOfferById)
    .put(offerController.updateOffer)
    .delete(offerController.deleteOffer);

/**
 * @swagger
 * /admin/offers/{id}/toggle-status:
 *   patch:
 *     summary: Toggle offer status
 *     tags: [Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer status toggled successfully
 */
router.patch('/:id/toggle-status', offerController.toggleOfferStatus);

module.exports = router;
