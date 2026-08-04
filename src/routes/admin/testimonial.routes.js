const express = require('express');
const router = express.Router();
const testimonialController = require('../../controllers/admin/testimonial.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { testimonialValidator } = require('../../validators/testimonial.validator');

/**
 * @swagger
 * tags:
 *   name: Admin Testimonials
 *   description: Testimonial management for admins
 */

/**
 * @swagger
 * /admin/testimonials:
 *   post:
 *     summary: Create a new testimonial
 *     tags: [Admin Testimonials]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - content
 *             properties:
 *               customerName:
 *                 type: string
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *               image_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Testimonial created successfully
 *   get:
 *     summary: Get all testimonials
 *     tags: [Admin Testimonials]
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
 *         description: Testimonials retrieved successfully
 */
router.route('/')
    .post(authMiddleware.protectAdmin, testimonialValidator, testimonialController.createTestimonial)
    .get(testimonialController.getAllTestimonials);

/**
 * @swagger
 * /admin/testimonials/{id}:
 *   get:
 *     summary: Get a single testimonial by ID
 *     tags: [Admin Testimonials]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial retrieved successfully
 *   put:
 *     summary: Update a testimonial by ID
 *     tags: [Admin Testimonials]
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
 *               customerName:
 *                 type: string
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *               image_url:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Testimonial updated successfully
 *   delete:
 *     summary: Delete a testimonial by ID
 *     tags: [Admin Testimonials]
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
 *         description: Testimonial deleted successfully
 */
router.route('/:id')
    .get(testimonialController.getTestimonialById)
    .put(authMiddleware.protectAdmin, testimonialValidator, testimonialController.updateTestimonial)
    .delete(authMiddleware.protectAdmin, testimonialController.deleteTestimonial);

module.exports = router;
