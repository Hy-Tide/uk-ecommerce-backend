const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/admin/coupon.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { createCouponValidator, updateCouponValidator, updateStatusValidator } = require('../../validators/coupon.validator');

/**
 * @swagger
 * tags:
 *   name: Admin Coupons
 *   description: Coupon management for admins
 */

/**
 * @swagger
 * /admin/coupons/usage-report:
 *   get:
 *     summary: Get coupon usage report
 *     tags: [Admin Coupons]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon usage report retrieved successfully
 */
router.get('/usage-report', authMiddleware.protectAdmin, couponController.getCouponUsageReport);

/**
 * @swagger
 * /admin/coupons:
 *   get:
 *     summary: Get all coupons (with pagination and search)
 *     tags: [Admin Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
 *   post:
 *     summary: Create a new coupon
 *     tags: [Admin Coupons]
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
 *               - discountType
 *               - discountValue
 *             properties:
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *               minPurchaseAmount:
 *                 type: number
 *               maxDiscountAmount:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *               usageLimit:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Coupon created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Coupon code already exists
 */
router.route('/')
    .get(authMiddleware.protectAdmin, couponController.getAllCoupons)
    .post(authMiddleware.protectAdmin, createCouponValidator, couponController.createCoupon);

/**
 * @swagger
 * /admin/coupons/{id}:
 *   get:
 *     summary: Get a single coupon by ID
 *     tags: [Admin Coupons]
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
 *         description: Coupon retrieved successfully
 *       404:
 *         description: Coupon not found
 *   put:
 *     summary: Update a coupon by ID
 *     tags: [Admin Coupons]
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
 *             properties:
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *               minPurchaseAmount:
 *                 type: number
 *               maxDiscountAmount:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *               usageLimit:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Coupon not found
 *   delete:
 *     summary: Delete a coupon by ID
 *     tags: [Admin Coupons]
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
 *         description: Coupon deleted successfully
 *       404:
 *         description: Coupon not found
 */
router.route('/:id')
    .get(authMiddleware.protectAdmin, couponController.getCouponById)
    .put(authMiddleware.protectAdmin, updateCouponValidator, couponController.updateCoupon)
    .delete(authMiddleware.protectAdmin, couponController.deleteCoupon);

/**
 * @swagger
 * /admin/coupons/{id}/status:
 *   patch:
 *     summary: Update coupon status
 *     tags: [Admin Coupons]
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
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Coupon status updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Coupon not found
 */
router.route('/:id/status')
    .patch(authMiddleware.protectAdmin, updateStatusValidator, couponController.updateCouponStatus);

module.exports = router;
