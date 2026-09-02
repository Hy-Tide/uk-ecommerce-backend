const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/website/order.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// All routes here require authentication
router.use(authMiddleware.protectWebsite);

/**
 * @swagger
 * tags:
 *   name: Website Orders
 *   description: Customer Order Management
 */

/**
 * @swagger
 * /website/orders:
 *   get:
 *     summary: Get all orders for the current user
 *     tags: [Website Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 */
router.get('/', orderController.getMyOrders);

/**
 * @swagger
 * /website/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Website Orders]
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
 * /website/orders/{id}/cancel:
 *   post:
 *     summary: Cancel an order
 *     tags: [Website Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled
 *       404:
 *         description: Order not found
 */
router.post('/:id/cancel', orderController.cancelOrder);

/**
 * @swagger
 * /website/orders/{id}/reorder:
 *   post:
 *     summary: Reorder items from a past order
 *     tags: [Website Orders]
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
 *         description: Items added to cart for reorder
 *       404:
 *         description: Order not found
 */
router.post('/:id/reorder', orderController.reorder);

/**
 * @swagger
 * /website/orders/{id}/buy-again:
 *   post:
 *     summary: Buy again items from a past order (robust)
 *     tags: [Website Orders]
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
 *         description: Items added to cart for buy again
 *       404:
 *         description: Order not found
 */
router.post('/:id/buy-again', orderController.buyAgain);

/**
 * @swagger
 * /website/orders/{id}/invoice:
 *   get:
 *     summary: Get order invoice
 *     tags: [Website Orders]
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
router.get('/:id/invoice', orderController.getInvoice);

module.exports = router;
