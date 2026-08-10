const express = require('express');
const router = express.Router();
const blogCategoryController = require('../../controllers/admin/blog_category.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const upload = require('../../config/upload');

/**
 * @swagger
 * tags:
 *   name: Admin Blog Categories
 *   description: Blog category management for admins
 */

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * /admin/blog-categories:
 *   get:
 *     summary: Get all blog categories
 *     tags: [Admin Blog Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blog categories retrieved successfully
 *   post:
 *     summary: Create a new blog category
 *     tags: [Admin Blog Categories]
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
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Blog category created successfully
 */
router.route('/')
    .get(blogCategoryController.getAllBlogCategories)
    .post(upload.single('image'), blogCategoryController.createBlogCategory);

/**
 * @swagger
 * /admin/blog-categories/{id}:
 *   get:
 *     summary: Get blog category by ID
 *     tags: [Admin Blog Categories]
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
 *         description: Blog category retrieved successfully
 *   put:
 *     summary: Update a blog category
 *     tags: [Admin Blog Categories]
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
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               displayOrder:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Blog category updated successfully
 *   delete:
 *     summary: Delete a blog category
 *     tags: [Admin Blog Categories]
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
 *         description: Blog category deleted successfully
 */
router.route('/:id')
    .get(blogCategoryController.getBlogCategoryById)
    .put(upload.single('image'), blogCategoryController.updateBlogCategory)
    .delete(blogCategoryController.deleteBlogCategory);

module.exports = router;
