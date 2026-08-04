const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/admin/banner.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { bannerValidator } = require('../../validators/banner.validator');

/**
 * @swagger
 * tags:
 *   name: Admin Banners
 *   description: Banner management for admins
 */

/**
 * @swagger
 * /admin/banners:
 *   post:
 *     summary: Create a new banner
 *     tags: [Admin Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image_url
 *             properties:
 *               title:
 *                 type: string
 *               image_url:
 *                 type: string
 *               link:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Banner created successfully
 *   get:
 *     summary: Get all banners
 *     tags: [Admin Banners]
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
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
router.route('/')
    .post(authMiddleware.protectAdmin, bannerValidator, bannerController.createBanner)
    .get(bannerController.getAllBanners);

/**
 * @swagger
 * /admin/banners/{id}:
 *   get:
 *     summary: Get a single banner by ID
 *     tags: [Admin Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banner retrieved successfully
 *   put:
 *     summary: Update a banner by ID
 *     tags: [Admin Banners]
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
 *               title:
 *                 type: string
 *               image_url:
 *                 type: string
 *               link:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *   delete:
 *     summary: Delete a banner by ID
 *     tags: [Admin Banners]
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
 *         description: Banner deleted successfully
 */
router.route('/:id')
    .get(bannerController.getBannerById)
    .put(authMiddleware.protectAdmin, bannerValidator, bannerController.updateBanner)
    .delete(authMiddleware.protectAdmin, bannerController.deleteBanner);

module.exports = router;
