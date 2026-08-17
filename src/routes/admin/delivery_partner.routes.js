const express = require('express');
const router = express.Router();
const partnerController = require('../../controllers/admin/delivery_partner.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { deliveryPartnerValidator } = require('../../validators/delivery_partner.validator');

/**
 * @swagger
 * tags:
 *   name: Admin Delivery Partners
 *   description: Delivery Partner management
 */

/**
 * @swagger
 * /admin/delivery-partners:
 *   post:
 *     summary: Create a new delivery partner
 *     tags: [Admin Delivery Partners]
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
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               vehicleType:
 *                 type: string
 *               vehicleNumber:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Delivery partner created successfully
 *   get:
 *     summary: Get all delivery partners
 *     tags: [Admin Delivery Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, ON_DELIVERY, INACTIVE]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Delivery partners retrieved successfully
 */
router.route('/')
    .post(authMiddleware.protectAdmin, deliveryPartnerValidator, partnerController.createPartner)
    .get(authMiddleware.protectAdmin, partnerController.getAllPartners);

/**
 * @swagger
 * /admin/delivery-partners/available:
 *   get:
 *     summary: Get available delivery partners
 *     tags: [Admin Delivery Partners]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available delivery partners retrieved successfully
 */
router.get('/available', authMiddleware.protectAdmin, partnerController.getAvailablePartners);

/**
 * @swagger
 * /admin/delivery-partners/{id}:
 *   get:
 *     summary: Get a delivery partner by ID
 *     tags: [Admin Delivery Partners]
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
 *         description: Delivery partner retrieved successfully
 *   put:
 *     summary: Update a delivery partner
 *     tags: [Admin Delivery Partners]
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
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               vehicleType:
 *                 type: string
 *               vehicleNumber:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, ON_DELIVERY, INACTIVE]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Delivery partner updated successfully
 *   delete:
 *     summary: Delete a delivery partner
 *     tags: [Admin Delivery Partners]
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
 *         description: Delivery partner deleted successfully
 */
router.route('/:id')
    .get(authMiddleware.protectAdmin, partnerController.getPartnerById)
    .put(authMiddleware.protectAdmin, deliveryPartnerValidator, partnerController.updatePartner)
    .delete(authMiddleware.protectAdmin, partnerController.deletePartner);

/**
 * @swagger
 * /admin/delivery-partners/{id}/assignments:
 *   get:
 *     summary: Get a partner's active assignments
 *     tags: [Admin Delivery Partners]
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
 *         description: Partner active assignments retrieved successfully
 */
router.get('/:id/assignments', authMiddleware.protectAdmin, partnerController.getPartnerAssignments);

/**
 * @swagger
 * /admin/delivery-partners/{id}/history:
 *   get:
 *     summary: Get a partner's delivery history
 *     tags: [Admin Delivery Partners]
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
 *         description: Partner delivery history retrieved successfully
 */
router.get('/:id/history', authMiddleware.protectAdmin, partnerController.getPartnerHistory);

module.exports = router;
