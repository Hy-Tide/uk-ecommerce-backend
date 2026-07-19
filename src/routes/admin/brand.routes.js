const express = require('express');
const router = express.Router();
const brandController = require('../../controllers/admin/brand.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { brandValidator } = require('../../validators/brand.validator');

// All admin brand routes require admin authentication
router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin Brands
 *   description: Brand management for admins
 */

/**
 * @swagger
 * /admin/brands:
 *   post:
 *     summary: Create a new brand
 *     tags: [Admin Brands]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Brand created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Brand name already exists
 *   get:
 *     summary: Get all brands (with pagination and search)
 *     tags: [Admin Brands]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 */
router.route('/')
    .post(brandValidator, brandController.createBrand)
    .get(brandController.getAllBrands);

/**
 * @swagger
 * /admin/brands/{id}:
 *   get:
 *     summary: Get a single brand by ID
 *     tags: [Admin Brands]
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
 *         description: Brand retrieved successfully
 *       404:
 *         description: Brand not found
 *   put:
 *     summary: Update a brand by ID
 *     tags: [Admin Brands]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *       404:
 *         description: Brand not found
 *   delete:
 *     summary: Delete a brand by ID
 *     tags: [Admin Brands]
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
 *         description: Brand deleted successfully
 *       404:
 *         description: Brand not found
 */
router.route('/:id')
    .get(brandController.getBrandById)
    .put(brandValidator, brandController.updateBrand)
    .delete(brandController.deleteBrand);

module.exports = router;
