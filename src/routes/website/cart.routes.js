const express = require('express');
const router = express.Router();
const cartController = require('../../controllers/website/cart.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// All routes here require authentication
router.use(authMiddleware.protectWebsite);

/**
 * @swagger
 * tags:
 *   name: Website Cart
 *   description: Customer Cart Management
 */

/**
 * @swagger
 * /website/cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Website Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 */
router.get('/', cartController.getCart);

/**
 * @swagger
 * /website/cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Website Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *               variationId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to cart
 *       400:
 *         description: Bad request (e.g., missing variationId, not enough stock)
 *       404:
 *         description: Product or variation not found
 */
router.post('/items', cartController.addItemToCart);

/**
 * @swagger
 * /website/cart/items/{itemId}:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Website Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: The _id of the item in the cart.items array
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item quantity updated
 *       400:
 *         description: Invalid quantity or not enough stock
 *       404:
 *         description: Cart or item not found
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Website Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       404:
 *         description: Cart not found
 */
router.route('/items/:itemId')
    .put(cartController.updateCartItemQuantity)
    .delete(cartController.removeCartItem);

/**
 * @swagger
 * /website/cart/clear:
 *   delete:
 *     summary: Clear the entire cart
 *     tags: [Website Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       404:
 *         description: Cart not found
 */
router.delete('/clear', cartController.clearCart);

/**
 * @swagger
 * /website/cart/coupon:
 *   post:
 *     summary: Apply a coupon to the cart
 *     tags: [Website Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *       400:
 *         description: Invalid coupon, expired, or minimum purchase not met
 *       404:
 *         description: Coupon not found
 *   delete:
 *     summary: Remove the applied coupon from the cart
 *     tags: [Website Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon removed successfully
 *       404:
 *         description: Cart not found
 */
router.route('/coupon')
    .post(cartController.applyCoupon)
    .delete(cartController.removeCoupon);

module.exports = router;
