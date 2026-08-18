const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/admin/blog.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const upload = require('../../config/upload');

/**
 * @swagger
 * tags:
 *   name: Admin Blogs
 *   description: Blog management for admins
 */

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * /admin/blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Admin Blogs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 *   post:
 *     summary: Create a new blog
 *     tags: [Admin Blogs]
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
 *               - categoryId
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               slug:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               author:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *                 description: Base64 encoded string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               metaKeywords:
 *                 type: string
 *               readingTime:
 *                 type: integer
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Blog created successfully
 */
router.route('/')
    .get(blogController.getAllBlogs)
    .post(upload.single('featuredImage'), blogController.createBlog);

/**
 * @swagger
 * /admin/blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Admin Blogs]
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
 *         description: Blog retrieved successfully
 *   put:
 *     summary: Update a blog
 *     tags: [Admin Blogs]
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
 *               slug:
 *                 type: string
 *               categoryId:
 *                 type: string
 *               author:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               featuredImage:
 *                 type: string
 *                 description: Base64 encoded string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               metaTitle:
 *                 type: string
 *               metaDescription:
 *                 type: string
 *               metaKeywords:
 *                 type: string
 *               readingTime:
 *                 type: integer
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *   delete:
 *     summary: Delete a blog
 *     tags: [Admin Blogs]
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
 *         description: Blog deleted successfully
 */


router.route('/:id')
    .get(blogController.getBlogById)
    .put(upload.single('featuredImage'), blogController.updateBlog)
    .delete(blogController.deleteBlog);

module.exports = router;
