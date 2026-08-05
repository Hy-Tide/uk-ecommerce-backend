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

module.exports = router;
