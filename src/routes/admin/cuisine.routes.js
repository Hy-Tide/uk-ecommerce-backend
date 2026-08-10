const express = require('express');
const router = express.Router();
const cuisineController = require('../../controllers/admin/cuisine.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const upload = require('../../config/upload');

/**
 * @swagger
 * tags:
 *   name: Admin Cuisines
 *   description: Cuisine management for admins
 */

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * /admin/cuisines:
 *   get:
 *     summary: Get all cuisines
 *     tags: [Admin Cuisines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuisines retrieved successfully
 *   post:
 *     summary: Create a new cuisine
 *     tags: [Admin Cuisines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Cuisine created successfully
 */
router.route('/')
    .get(cuisineController.getAllCuisines)
    .post(upload.single('image'), cuisineController.createCuisine);

/**
 * @swagger
 * /admin/cuisines/{id}:
 *   get:
 *     summary: Get cuisine by ID
 *     tags: [Admin Cuisines]
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
 *         description: Cuisine retrieved successfully
 *   put:
 *     summary: Update a cuisine
 *     tags: [Admin Cuisines]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cuisine updated successfully
 *   delete:
 *     summary: Delete a cuisine
 *     tags: [Admin Cuisines]
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
 *         description: Cuisine deleted successfully
 */
router.route('/:id')
    .get(cuisineController.getCuisineById)
    .put(upload.single('image'), cuisineController.updateCuisine)
    .delete(cuisineController.deleteCuisine);

module.exports = router;
