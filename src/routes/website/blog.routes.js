const express = require('express');
const router = express.Router();
const blogController = require('../../controllers/website/blog.controller');

/**
 * @swagger
 * tags:
 *   name: Website Blogs
 *   description: Blog fetching for customers
 */

/**
 * @swagger
 * /website/blogs:
 *   get:
 *     summary: Get all active blogs
 *     tags: [Website Blogs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 */
router.get('/', blogController.getBlogs);

/**
 * @swagger
 * /website/blogs/{slug}:
 *   get:
 *     summary: Get blog details by slug
 *     tags: [Website Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog details retrieved successfully
 */
router.get('/:slug', blogController.getBlogDetails);

/**
 * @swagger
 * /website/blogs/{slug}/related:
 *   get:
 *     summary: Get related blogs for a given blog slug
 *     tags: [Website Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Related blogs retrieved successfully
 */
router.get('/:slug/related', blogController.getRelatedBlogs);

module.exports = router;
