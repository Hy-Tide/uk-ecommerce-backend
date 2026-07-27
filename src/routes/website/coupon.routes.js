const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/website/coupon.controller');
const authMiddleware = require('../../middleware/auth.middleware');

// All routes here require authentication
router.use(authMiddleware.protectWebsite);

/**
 * @swagger
 * tags:
 *   name: Website Coupons
 *   description: Customer Coupon viewing
 */

/**
 * @swagger
 * /website/coupons:
 *   get:
 *     summary: Get available coupons
 *     tags: [Website Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available coupons retrieved successfully
 */
router.get('/', couponController.getAvailableCoupons);

module.exports = router;
