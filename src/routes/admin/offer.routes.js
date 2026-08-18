const express = require('express');
const router = express.Router();
const offerController = require('../../controllers/admin/offer.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const upload = require('../../config/upload');

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
 *                 description: Base64 encoded string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Offer created successfully
 */
router.route('/')
    .get(offerController.getAllOffers)
    .post(upload.single('bannerImage'), offerController.createOffer);

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
 *                 description: Base64 encoded string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
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
    .put(upload.single('bannerImage'), offerController.updateOffer)
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

/**
 * @swagger
 * /admin/offers/{id}/products:
 *   get:
 *     summary: Get mapped products for an offer
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
 *         description: Products retrieved successfully
 *   post:
 *     summary: Map products to an offer
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
 *             required:
 *               - productIds
 *             properties:
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Products added to offer successfully
 */
router.route('/:id/products')
    .get(offerController.getOfferProducts)
    .post(offerController.addProductsToOffer);

/**
 * @swagger
 * /admin/offers/{id}/products/{productId}:
 *   delete:
 *     summary: Remove a product from an offer
 *     tags: [Admin Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product removed from offer successfully
 */
router.delete('/:id/products/:productId', offerController.removeProductFromOffer);

module.exports = router;
