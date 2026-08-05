const express = require('express');
const router = express.Router();
const roleController = require('../../controllers/admin/role.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Roles
 *   description: RBAC Roles Management
 */

router.use(authMiddleware.protectAdmin);
// Only admins with 'manage_roles' or '*' can hit these routes
router.use(authMiddleware.requirePermission('manage_roles'));

/**
 * @swagger
 * /admin/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Admin Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *   post:
 *     summary: Create a new role
 *     tags: [Admin Roles]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 */
router.route('/')
    .get(roleController.getAllRoles)
    .post(roleController.createRole);

/**
 * @swagger
 * /admin/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Admin Roles]
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
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 *   delete:
 *     summary: Delete a role
 *     tags: [Admin Roles]
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
 *         description: Role deleted successfully
 */
router.route('/:id')
    .put(roleController.updateRole)
    .delete(roleController.deleteRole);

module.exports = router;
