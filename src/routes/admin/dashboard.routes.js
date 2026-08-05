const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboard.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Dashboard
 *   description: High-level analytics and overviews
 */

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard overview data
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
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
 *                     overview:
 *                       type: object
 *                       properties:
 *                         revenue:
 *                           type: number
 *                         orders:
 *                           type: integer
 *                         customers:
 *                           type: integer
 *                         products:
 *                           type: integer
 *                     ordersBreakdown:
 *                       type: object
 *                       properties:
 *                         pending:
 *                           type: integer
 *                         cancelled:
 *                           type: integer
 *                         delivered:
 *                           type: integer
 *                     recentOrders:
 *                       type: array
 *                       items:
 *                         type: object
 *                     lowStockProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                     topCategories:
 *                       type: array
 *                       items:
 *                         type: object
 *                     topBrands:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/', dashboardController.getDashboardData);

module.exports = router;
