const express = require('express');
const router = express.Router();
const deliveryZoneController = require('../../controllers/admin/delivery_zone.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { deliveryZoneValidator } = require('../../validators/delivery_zone.validator');

/**
 * @swagger
 * tags:
 *   name: Admin Delivery Zones
 *   description: Delivery Zone management for admins
 */

/**
 * @swagger
 * /admin/delivery-zones:
 *   post:
 *     summary: Create a new delivery zone
 *     tags: [Admin Delivery Zones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - shapeType
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               shapeType:
 *                 type: string
 *                 enum: [polygon, circle]
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: array
 *                 description: Required if shapeType is polygon. Array of rings. Example - [[[lng, lat], [lng, lat], ...]]
 *               center:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Required if shapeType is circle. Example - [lng, lat]
 *               radius:
 *                 type: number
 *                 description: Required if shapeType is circle. Radius in meters.
 *               deliveryCharge:
 *                 type: number
 *               minimumOrderValue:
 *                 type: number
 *               estimatedDeliveryTime:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Delivery zone created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Delivery zone with this name already exists
 *   get:
 *     summary: Get all delivery zones (with pagination and search)
 *     tags: [Admin Delivery Zones]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Delivery zones retrieved successfully
 */
router.route('/')
    .post(authMiddleware.protectAdmin, deliveryZoneValidator, deliveryZoneController.createDeliveryZone)
    .get(authMiddleware.protectAdmin, deliveryZoneController.getAllDeliveryZones);

/**
 * @swagger
 * /admin/delivery-zones/{id}:
 *   get:
 *     summary: Get a single delivery zone by ID
 *     tags: [Admin Delivery Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery zone retrieved successfully
 *       404:
 *         description: Delivery zone not found
 *   put:
 *     summary: Update a delivery zone by ID
 *     tags: [Admin Delivery Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               shapeType:
 *                 type: string
 *                 enum: [polygon, circle]
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: array
 *                 description: Required if shapeType is polygon. Array of rings. Example - [[[lng, lat], [lng, lat], ...]]
 *               center:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Required if shapeType is circle. Example - [lng, lat]
 *               radius:
 *                 type: number
 *                 description: Required if shapeType is circle. Radius in meters.
 *               deliveryCharge:
 *                 type: number
 *               minimumOrderValue:
 *                 type: number
 *               estimatedDeliveryTime:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Delivery zone updated successfully
 *       404:
 *         description: Delivery zone not found
 *       409:
 *         description: Delivery zone with this name already exists
 *   delete:
 *     summary: Delete a delivery zone by ID
 *     tags: [Admin Delivery Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery zone deleted successfully
 *       404:
 *         description: Delivery zone not found
 */
router.route('/:id')
    .get(authMiddleware.protectAdmin, deliveryZoneController.getDeliveryZoneById)
    .put(authMiddleware.protectAdmin, deliveryZoneValidator, deliveryZoneController.updateDeliveryZone)
    .delete(authMiddleware.protectAdmin, deliveryZoneController.deleteDeliveryZone);

module.exports = router;
