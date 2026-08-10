const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/website/banner.controller');

/**
 * @swagger
 * tags:
 *   name: Website Banners
 *   description: Banner endpoints for website pages
 */

/**
 * @swagger
 * /website/banners/offers:
 *   get:
 *     summary: Get banners for the offers page
 *     tags: [Website Banners]
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
router.get('/offers', bannerController.getOfferBanners);

/**
 * @swagger
 * /website/banners/blogs:
 *   get:
 *     summary: Get banners for the blogs page
 *     tags: [Website Banners]
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
router.get('/blogs', bannerController.getBlogBanners);

/**
 * @swagger
 * /website/banners/recipes:
 *   get:
 *     summary: Get banners for the recipes page
 *     tags: [Website Banners]
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
router.get('/recipes', bannerController.getRecipeBanners);

/**
 * @swagger
 * /website/banners/contact-us:
 *   get:
 *     summary: Get banners for the contact-us page
 *     tags: [Website Banners]
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
router.get('/contact-us', bannerController.getContactUsBanners);

module.exports = router;
