const express = require('express');
const router = express.Router();
const homeConfigController = require('../../controllers/admin/home_configuration.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { homeConfigurationValidator, reorderValidator } = require('../../validators/home_configuration.validator');

/**
 * @swagger
 * tags:
 *   name: Admin Home Configuration
 *   description: Homepage configuration management for admins
 */

/**
 * @swagger
 * /admin/home-config:
 *   post:
 *     summary: Create a new home configuration section
 *     tags: [Admin Home Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sectionType
 *               - displayOrder
 *             properties:
 *               sectionType:
 *                 type: string
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *               dataSource:
 *                 type: string
 *               productLimit:
 *                 type: integer
 *               filters:
 *                 type: object
 *               buttonText:
 *                 type: string
 *               buttonUrl:
 *                 type: string
 *               highlightTitle:
 *                 type: string
 *               description:
 *                 type: string
 *               desktopImage:
 *                 type: string
 *               mobileImage:
 *                 type: string
 *               backgroundImage:
 *                 type: string
 *               iconImage:
 *                 type: string
 *               bannerImage:
 *                 type: string
 *               primaryButtonText:
 *                 type: string
 *               primaryButtonUrl:
 *                 type: string
 *               secondaryButtonText:
 *                 type: string
 *               secondaryButtonUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               settings:
 *                 type: object
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Home configuration section created successfully
 *   get:
 *     summary: Get all home configuration sections
 *     tags: [Admin Home Configuration]
 *     responses:
 *       200:
 *         description: Sections retrieved successfully
 */
router.route('/')
    .post(authMiddleware.protectAdmin, homeConfigurationValidator, homeConfigController.createSection)
    .get(homeConfigController.getAllSections);

/**
 * @swagger
 * /admin/home-config/reorder:
 *   put:
 *     summary: Bulk update display order
 *     tags: [Admin Home Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     displayOrder:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Display order updated successfully
 */
router.route('/reorder')
    .put(authMiddleware.protectAdmin, reorderValidator, homeConfigController.updateDisplayOrder);

/**
 * @swagger
 * /admin/home-config/{id}:
 *   get:
 *     summary: Get a single home configuration section by ID
 *     tags: [Admin Home Configuration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Section retrieved successfully
 *   put:
 *     summary: Update a home configuration section by ID
 *     tags: [Admin Home Configuration]
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
 *               sectionType:
 *                 type: string
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               enabled:
 *                 type: boolean
 *               displayOrder:
 *                 type: integer
 *               dataSource:
 *                 type: string
 *               productLimit:
 *                 type: integer
 *               filters:
 *                 type: object
 *               buttonText:
 *                 type: string
 *               buttonUrl:
 *                 type: string
 *               highlightTitle:
 *                 type: string
 *               description:
 *                 type: string
 *               desktopImage:
 *                 type: string
 *               mobileImage:
 *                 type: string
 *               backgroundImage:
 *                 type: string
 *               iconImage:
 *                 type: string
 *               bannerImage:
 *                 type: string
 *               primaryButtonText:
 *                 type: string
 *               primaryButtonUrl:
 *                 type: string
 *               secondaryButtonText:
 *                 type: string
 *               secondaryButtonUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               settings:
 *                 type: object
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Section updated successfully
 *   delete:
 *     summary: Delete a home configuration section by ID
 *     tags: [Admin Home Configuration]
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
 *         description: Section deleted successfully
 */
router.route('/:id')
    .get(homeConfigController.getSectionById)
    .put(authMiddleware.protectAdmin, homeConfigurationValidator, homeConfigController.updateSection)
    .delete(authMiddleware.protectAdmin, homeConfigController.deleteSection);

/**
 * @swagger
 * /admin/home-config/{id}/toggle:
 *   patch:
 *     summary: Toggle section visibility/status
 *     tags: [Admin Home Configuration]
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
 *         description: Section status toggled successfully
 */
router.route('/:id/toggle')
    .patch(authMiddleware.protectAdmin, homeConfigController.toggleSectionStatus);

module.exports = router;
