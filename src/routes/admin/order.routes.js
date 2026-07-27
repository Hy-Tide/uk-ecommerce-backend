const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/order.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// All routes here require admin authentication
router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin Orders
 *   description: Order management for admins
 */

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     summary: Get all orders (with pagination and filtering)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by orderNumber
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by orderStatus
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get('/', orderController.getAllOrders);

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Admin Orders]
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
 *         description: Order details retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get('/:id', orderController.getOrderDetails);

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Admin Orders]
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
 *               - orderStatus
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [Pending, Confirmed, Preparing, Ready For Delivery, Delivered, Cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid order status
 *       404:
 *         description: Order not found
 */
router.patch('/:id/status', orderController.updateOrderStatus);

/**
 * @swagger
 * /admin/orders/{id}/assign-delivery:
 *   patch:
 *     summary: Assign a delivery person to an order
 *     tags: [Admin Orders]
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
 *               - deliveryPersonId
 *             properties:
 *               deliveryPersonId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery person assigned successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Order not found
 */
router.patch('/:id/assign-delivery', orderController.assignDeliveryPerson);

/**
 * @swagger
 * /admin/orders/{id}/invoice:
 *   get:
 *     summary: Print / Get order invoice for admin
 *     tags: [Admin Orders]
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
 *         description: Invoice retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get('/:id/invoice', orderController.printInvoice);

module.exports = router;
