const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/user.controller');
const { protectAdmin } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Users
 *   description: User management for admin panel
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all admin users
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin users retrieved successfully
 */
router.route('/')
    .get(protectAdmin, userController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get an admin user by ID
 *     tags: [Admin Users]
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
 *         description: Admin user retrieved successfully
 *       404:
 *         description: Admin user not found
 *   patch:
 *     summary: Update an admin user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               role_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin user updated successfully
 *       404:
 *         description: Admin user not found
 *   delete:
 *     summary: Delete an admin user
 *     tags: [Admin Users]
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
 *         description: Admin user deleted successfully
 *       404:
 *         description: Admin user not found
 */
router.route('/:id')
    .get(protectAdmin, userController.getUserById)
    .patch(protectAdmin, userController.updateUser)
    .delete(protectAdmin, userController.deleteUser);

module.exports = router;
