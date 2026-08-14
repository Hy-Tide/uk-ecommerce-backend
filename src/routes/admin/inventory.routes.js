const express = require('express');
const router = express.Router();
const inventoryController = require('../../controllers/admin/inventory.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Inventory
 *   description: Inventory management for admins
 */

/**
 * @swagger
 * /admin/inventory:
 *   get:
 *     summary: Get all inventory
 *     tags: [Admin Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *       - in: query
 *         name: stockStatus
 *         schema:
 *           type: string
 *           enum: [In Stock, Low Stock, Out of Stock]
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [stockAsc, stockDesc, name, -name]
 *     responses:
 *       200:
 *         description: Inventory retrieved successfully
 */
router.get('/', authMiddleware.protectAdmin, inventoryController.getInventory);

/**
 * @swagger
 * /admin/inventory/critical-stock-alert:
 *   get:
 *     summary: Get critical stock alerts
 *     tags: [Admin Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OUT_OF_STOCK, LOW_STOCK]
 *     responses:
 *       200:
 *         description: Critical stock alerts retrieved successfully
 */
router.get('/critical-stock-alert', authMiddleware.protectAdmin, inventoryController.getCriticalStockAlerts);

/**
 * @swagger
 * /admin/inventory/stock-management-logs:
 *   get:
 *     summary: Get stock management logs
 *     tags: [Admin Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: product
 *         schema:
 *           type: string
 *           description: Product ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [STOCK_ADDED, STOCK_REMOVED, STOCK_ADJUSTED]
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *           description: User ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Stock management logs retrieved successfully
 */
router.get('/stock-management-logs', authMiddleware.protectAdmin, inventoryController.getStockManagementLogs);

module.exports = router;
