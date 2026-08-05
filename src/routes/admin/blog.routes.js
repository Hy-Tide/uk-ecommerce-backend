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

router.route('/')
    .get(blogController.getAllBlogs)
    .post(blogController.createBlog);

router.route('/:id')
    .get(blogController.getBlogById)
    .put(blogController.updateBlog)
    .delete(blogController.deleteBlog);

module.exports = router;
