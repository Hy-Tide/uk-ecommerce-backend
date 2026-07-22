const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/admin/category.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { categoryValidator } = require('../../validators/category.validator');

// All admin category routes require admin authentication
router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * tags:
 *   name: Admin Categories
 *   description: Category management for admins
 */

/**
 * @swagger
 * /admin/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Admin Categories]
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
 *               image:
 *                 type: string
 *               icon:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Category name already exists
 *   get:
 *     summary: Get all categories (with pagination and search)
 *     tags: [Admin Categories]
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
 *           enum: [Active, Inactive]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.route('/')
    .post(categoryValidator, categoryController.createCategory)
    .get(categoryController.getAllCategories);

/**
 * @swagger
 * /admin/categories/{id}:
 *   get:
 *     summary: Get a single category by ID
 *     tags: [Admin Categories]
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
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 *   put:
 *     summary: Update a category by ID
 *     tags: [Admin Categories]
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
 *               image:
 *                 type: string
 *               icon:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive]
 *               seoTitle:
 *                 type: string
 *               seoDescription:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Admin Categories]
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
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */
router.route('/:id')
    .get(categoryController.getCategoryById)
    .put(categoryValidator, categoryController.updateCategory)
    .delete(categoryController.deleteCategory);

module.exports = router;
