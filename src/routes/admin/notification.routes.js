const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/admin/notification.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Notifications
 *   description: Notification management for admins
 */

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * /admin/notifications/send:
 *   post:
 *     summary: Send notification to a specific user
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               userId:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification sent successfully
 */
router.post('/send', notificationController.sendNotification);

/**
 * @swagger
 * /admin/notifications/broadcast:
 *   post:
 *     summary: Broadcast notification to all active users
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Broadcast notification sent successfully
 */
router.post('/broadcast', notificationController.broadcastNotification);

/**
 * @swagger
 * /admin/notifications/history:
 *   get:
 *     summary: Get history of all sent notifications
 *     tags: [Admin Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notification history retrieved successfully
 */
router.get('/history', notificationController.getNotificationHistory);

module.exports = router;
