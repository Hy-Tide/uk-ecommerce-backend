const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/website/blog.controller');

/**
 * @swagger
 * tags:
 *   name: Website Blogs
 *   description: Blog fetching for customers
 */

router.get('/', blogController.getBlogs);
router.get('/:slug', blogController.getBlogDetails);
router.get('/:slug/related', blogController.getRelatedBlogs);

module.exports = router;
