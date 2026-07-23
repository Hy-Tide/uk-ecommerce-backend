const express = require('express');
const router = express.Router();
const uploadController = require('../../controllers/admin/upload.controller');
const upload = require('../../config/upload');
const authMiddleware = require('../../middleware/auth.middleware');

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin Uploads
 *   description: File upload endpoints for admin
 */

/**
 * @swagger
 * /admin/upload:
 *   post:
 *     summary: Upload a single image
 *     tags: [Admin Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 */
router.post('/', upload.single('image'), uploadController.uploadImage);

/**
 * @swagger
 * /admin/upload/multiple:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Admin Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 */
router.post('/multiple', upload.array('images', 5), uploadController.uploadImage);

module.exports = router;
