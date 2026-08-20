const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/website/home.controller');

/**
 * @swagger
 * tags:
 *   name: Website Home
 *   description: Homepage dynamic content
 */

/**
 * @swagger
 * /website/home:
 *   get:
 *     summary: Get all enabled homepage sections with their resolved data
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Homepage retrieved successfully
 */
router.get('/', homeController.getHomepage);

/**
 * @swagger
 * /website/home/features:
 *   get:
 *     summary: Get Service Features section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Features retrieved successfully
 */
router.get('/features', homeController.getFeatures);

/**
 * @swagger
 * /website/home/banners:
 *   get:
 *     summary: Get Hero/Promo Banners section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Banners retrieved successfully
 */
router.get('/banners', homeController.getBanners);

/**
 * @swagger
 * /website/home/categories:
 *   get:
 *     summary: Get Shop by Categories section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', homeController.getCategories);

/**
 * @swagger
 * /website/home/best-deals:
 *   get:
 *     summary: Get Today's Best Deals section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Best Deals retrieved successfully
 */
router.get('/best-deals', homeController.getBestDeals);

/**
 * @swagger
 * /website/home/limited-products:
 *   get:
 *     summary: Get Limited Products section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Limited Products retrieved successfully
 */
router.get('/limited-products', homeController.getLimitedProducts);

/**
 * @swagger
 * /website/home/subscription-banner:
 *   get:
 *     summary: Get Subscription Banner section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Subscription Banner retrieved successfully
 */
router.get('/subscription-banner', homeController.getSubscriptionBanner);

/**
 * @swagger
 * /website/home/brands:
 *   get:
 *     summary: Get Shop by Brands section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 */
router.get('/brands', homeController.getBrands);

/**
 * @swagger
 * /website/home/new-arrivals:
 *   get:
 *     summary: Get New Arrivals section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: New Arrivals retrieved successfully
 */
router.get('/new-arrivals', homeController.getNewArrivals);

/**
 * @swagger
 * /website/home/popular-recipes:
 *   get:
 *     summary: Get Popular Recipes section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Popular Recipes retrieved successfully
 */
router.get('/popular-recipes', homeController.getPopularRecipes);

/**
 * @swagger
 * /website/home/testimonials:
 *   get:
 *     summary: Get Testimonials section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Testimonials retrieved successfully
 */
router.get('/testimonials', homeController.getTestimonials);

/**
 * @swagger
 * /website/home/why-choose-us:
 *   get:
 *     summary: Get Why Choose Us section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Why Choose Us retrieved successfully
 */
router.get('/why-choose-us', homeController.getWhyChooseUs);

/**
 * @swagger
 * /website/home/offers:
 *   get:
 *     summary: Get Offer Banners section
 *     tags: [Website Home]
 *     responses:
 *       200:
 *         description: Offers retrieved successfully
 */
router.get('/offers', homeController.getOffers);

module.exports = router;
