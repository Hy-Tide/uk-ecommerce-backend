const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/admin/blog.controller');
const authMiddleware = require('../../middleware/auth.middleware');

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
 *     responses:
 *       201:
 *         description: Blog created successfully
 */
router.route('/')
    .get(blogController.getAllBlogs)
    .post(blogController.createBlog);

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
    .put(blogController.updateBlog)
    .delete(blogController.deleteBlog);

module.exports = router;
