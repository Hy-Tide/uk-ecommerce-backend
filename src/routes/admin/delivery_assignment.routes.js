const express = require('express');
const router = express.Router();
const assignmentController = require('../../controllers/admin/delivery_assignment.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { assignDeliveryValidator, updateDeliveryStatusValidator } = require('../../validators/delivery_assignment.validator');

/**
 * @swagger
 * tags:
 *   name: Admin Delivery Assignments
 *   description: Order delivery assignment management
 */

/**
 * @swagger
 * /admin/delivery-assignments/assign:
 *   post:
 *     summary: Assign an order to a delivery partner
 *     tags: [Admin Delivery Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - deliveryPartnerId
 *             properties:
 *               orderId:
 *                 type: string
 *               deliveryPartnerId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order assigned successfully
 */
router.post('/assign', authMiddleware.protectAdmin, assignDeliveryValidator, assignmentController.assignOrder);

/**
 * @swagger
 * /admin/delivery-assignments/reassign:
 *   post:
 *     summary: Reassign an order to a different delivery partner
 *     tags: [Admin Delivery Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - deliveryPartnerId
 *             properties:
 *               orderId:
 *                 type: string
 *               deliveryPartnerId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order reassigned successfully
 */
router.post('/reassign', authMiddleware.protectAdmin, assignDeliveryValidator, assignmentController.reassignOrder);

/**
 * @swagger
 * /admin/delivery-assignments/{id}/status:
 *   put:
 *     summary: Update delivery status for an assignment
 *     tags: [Admin Delivery Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Delivery Assignment ID
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
 *                 enum: [ACCEPTED, PICKED_UP, OUT_FOR_DELIVERY, DELIVERED, FAILED, CANCELLED]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery status updated successfully
 */
router.put('/:id/status', authMiddleware.protectAdmin, updateDeliveryStatusValidator, assignmentController.updateDeliveryStatus);

/**
 * @swagger
 * /admin/delivery-assignments/order/{orderId}/history:
 *   get:
 *     summary: Get delivery history for an order
 *     tags: [Admin Delivery Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order delivery history retrieved successfully
 */
router.get('/order/:orderId/history', authMiddleware.protectAdmin, assignmentController.getAssignmentHistory);

module.exports = router;
