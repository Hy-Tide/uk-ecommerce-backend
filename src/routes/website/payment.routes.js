const express = require('express');
const router = express.Router();
const paymentController = require('../../controllers/website/payment.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Website Payments
 *   description: Payment processing for customers
 */

/**
 * @swagger
 * /website/payments/webhook:
 *   post:
 *     summary: Stripe webhook for payment events
 *     tags: [Website Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook received successfully
 */

router.use(authMiddleware.protectWebsite);

/**
 * @swagger
 * /website/payments/create-payment-intent:
 *   post:
 *     summary: Create a Stripe PaymentIntent for an order
 *     tags: [Website Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 type: object
 *               billingAddress:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 */
router.post('/create-payment-intent', paymentController.createPaymentIntent);

/**
 * @swagger
 * /website/payments/{orderId}:
 *   get:
 *     summary: Get payment status for a specific order
 *     tags: [Website Payments]
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
 *         description: Payment status retrieved successfully
 */
router.get('/:orderId', paymentController.getPaymentStatus);

/**
 * @swagger
 * /website/payments/verify:
 *   post:
 *     summary: Verify payment intent and create order
 *     tags: [Website Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified and order created
 */
router.post('/verify', paymentController.verifyPaymentAndOrder);

module.exports = router;
