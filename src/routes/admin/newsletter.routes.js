const express = require('express');
const router = express.Router();
const newsletterController = require('../../controllers/admin/newsletter.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Newsletter
 *   description: Manage newsletter subscribers
 */

/**
 * @swagger
 * /admin/newsletter/subscribers:
 *   get:
 *     summary: Get all subscribers
 *     tags: [Admin Newsletter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscribers retrieved successfully
 */
router.route('/subscribers')
    .get(authMiddleware.protectAdmin, newsletterController.getSubscribers);

/**
 * @swagger
 * /admin/newsletter/subscribers/{id}:
 *   get:
 *     summary: Get subscriber by ID
 *     tags: [Admin Newsletter]
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
 *         description: Subscriber retrieved successfully
 *   delete:
 *     summary: Delete a subscriber
 *     tags: [Admin Newsletter]
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
 *         description: Subscriber deleted successfully
 */
router.route('/subscribers/:id')
    .get(authMiddleware.protectAdmin, newsletterController.getSubscriberById)
    .delete(authMiddleware.protectAdmin, newsletterController.deleteSubscriber);

/**
 * @swagger
 * /admin/newsletter/subscribers/{id}/status:
 *   patch:
 *     summary: Update subscriber status
 *     tags: [Admin Newsletter]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, unsubscribed]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.route('/subscribers/:id/status')
    .patch(authMiddleware.protectAdmin, newsletterController.updateSubscriberStatus);

module.exports = router;
