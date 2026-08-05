const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/admin/payment.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Payments
 *   description: Payment management and reporting for admins
 */

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * /admin/payments:
 *   get:
 *     summary: Get all payments (Payment Report)
 *     tags: [Admin Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by Order ID or Customer name/email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Processing, Paid, Failed, Refunded]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
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
 *         description: Payments retrieved successfully
 */
router.get('/', paymentController.getAllPayments);

/**
 * @swagger
 * /admin/payments/failed:
 *   get:
 *     summary: Get failed payments
 *     tags: [Admin Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
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
 *         description: Failed payments retrieved successfully
 */
router.get('/failed', paymentController.getFailedPayments);

/**
 * @swagger
 * /admin/payments/{id}:
 *   get:
 *     summary: Get payment details by ID
 *     tags: [Admin Payments]
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
 *         description: Payment details retrieved successfully
 */
router.get('/:id', paymentController.getPaymentDetails);

/**
 * @swagger
 * /admin/payments/{id}/refund:
 *   post:
 *     summary: Initiate a refund via Stripe
 *     tags: [Admin Payments]
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
 *               amount:
 *                 type: number
 *                 description: Optional amount for partial refund. If empty, full refund is processed.
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 */
router.post('/:id/refund', paymentController.refundPayment);

module.exports = router;
