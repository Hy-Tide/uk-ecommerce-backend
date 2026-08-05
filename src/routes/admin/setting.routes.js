const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/admin/setting.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Settings
 *   description: Global store configurations
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       properties:
 *         storeName:
 *           type: string
 *         address:
 *           type: string
 *         contactEmail:
 *           type: string
 *         supportEmail:
 *           type: string
 *         phone:
 *           type: string
 *         whatsappNumber:
 *           type: string
 *         socialMedia:
 *           type: object
 *           properties:
 *             facebook:
 *               type: string
 *             twitter:
 *               type: string
 *             instagram:
 *               type: string
 *             linkedin:
 *               type: string
 *         currency:
 *           type: string
 *         taxPercentage:
 *           type: number
 *         deliveryCharge:
 *           type: number
 *         minimumOrderAmount:
 *           type: number
 *         freeDeliveryAmount:
 *           type: number
 *         stripeKeys:
 *           type: object
 *           properties:
 *             publicKey:
 *               type: string
 *             secretKey:
 *               type: string
 *         paypalKeys:
 *           type: object
 *           properties:
 *             clientId:
 *               type: string
 *             secret:
 *               type: string
 *         googlePayMerchantId:
 *           type: string
 *         logoUrl:
 *           type: string
 *         faviconUrl:
 *           type: string
 */

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     summary: Get global store settings
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     settings:
 *                       $ref: '#/components/schemas/Settings'
 *   put:
 *     summary: Update global store settings
 *     tags: [Admin Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Settings'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     settings:
 *                       $ref: '#/components/schemas/Settings'
 */
router.route('/')
    .get(settingController.getSettings)
    .put(settingController.updateSettings);

module.exports = router;
