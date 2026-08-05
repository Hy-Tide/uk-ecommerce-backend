const express = require('express');
const router = express.Router();
const blogCategoryController = require('../../controllers/admin/blog_category.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Blog Categories
 *   description: Blog category management for admins
 */

router.use(authMiddleware.protectAdmin);

router.route('/')
    .get(blogCategoryController.getAllBlogCategories)
    .post(blogCategoryController.createBlogCategory);

router.route('/:id')
    .get(blogCategoryController.getBlogCategoryById)
    .put(blogCategoryController.updateBlogCategory)
    .delete(blogCategoryController.deleteBlogCategory);

module.exports = router;
