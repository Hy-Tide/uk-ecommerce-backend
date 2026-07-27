const express = require('express');
const router = express.Router();
const wishlistController = require('../../controllers/website/wishlist.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// All routes here require authentication
router.use(authMiddleware.protectWebsite);

/**
 * @swagger
 * tags:
 *   name: Website Wishlist
 *   description: Customer Wishlist Management
 */

/**
 * @swagger
 * /website/wishlist:
 *   get:
 *     summary: Get current user's wishlist
 *     tags: [Website Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
 *   post:
 *     summary: Add product to wishlist
 *     tags: [Website Wishlist]
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
 *     responses:
 *       200:
 *         description: Product added to wishlist
 *       400:
 *         description: Product ID is required
 *       404:
 *         description: Product not found
 */
router.route('/')
    .get(wishlistController.getWishlist)
    .post(wishlistController.addToWishlist);

/**
 * @swagger
 * /website/wishlist/{productId}:
 *   delete:
 *     summary: Remove product from wishlist
 *     tags: [Website Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product removed from wishlist
 *       404:
 *         description: Wishlist not found
 */
router.route('/:productId')
    .delete(wishlistController.removeFromWishlist);

module.exports = router;
