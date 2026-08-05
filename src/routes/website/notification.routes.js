const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/website/notification.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Website Notifications
 *   description: Notification endpoints for authenticated users
 */

router.use(authMiddleware.protectWebsite);

/**
 * @swagger
 * /website/notifications:
 *   get:
 *     summary: Get my notifications
 *     tags: [Website Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get('/', notificationController.getMyNotifications);

/**
 * @swagger
 * /website/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Website Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.patch('/read-all', notificationController.markAllAsRead);

/**
 * @swagger
 * /website/notifications/{id}/read:
 *   patch:
 *     summary: Mark a specific notification as read
 *     tags: [Website Notifications]
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
 *         description: Notification marked as read
 */
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
