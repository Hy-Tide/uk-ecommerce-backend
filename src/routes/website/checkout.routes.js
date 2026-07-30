const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/website/checkout.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// All routes here require authentication
router.use(authMiddleware.protectWebsite);

/**
 * @swagger
 * tags:
 *   name: Website Checkout
 *   description: Customer Checkout Process
 */

/**
 * @swagger
 * /website/checkout/validate:
 *   post:
 *     summary: Validate cart for checkout
 *     tags: [Website Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checkout validated successfully
 *       400:
 *         description: Validation failed (e.g. out of stock, invalid coupon, empty cart)
 */
router.post('/validate', checkoutController.validateCheckout);

/**
 * @swagger
 * /website/checkout/payment-methods:
 *   get:
 *     summary: Get available payment methods
 *     tags: [Website Checkout]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 */
router.get('/payment-methods', checkoutController.getPaymentMethods);

/**
 * @swagger
 * /website/checkout/place-order:
 *   post:
 *     summary: Place an order
 *     tags: [Website Checkout]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   houseNumber:
 *                     type: string
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   county:
 *                     type: string
 *                   postcode:
 *                     type: string
 *                   addressType:
 *                     type: string
 *               billingAddress:
 *                 type: object
 *                 properties:
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   email:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   houseNumber:
 *                     type: string
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   county:
 *                     type: string
 *                   postcode:
 *                     type: string
 *               deliveryNotes:
 *                 type: string
 *               deliverySlot:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Bad request (empty cart, out of stock, missing info)
 */
router.post('/place-order', checkoutController.placeOrder);

module.exports = router;
