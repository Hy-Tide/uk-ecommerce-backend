const express = require('express');
const router = express.Router();
const userController = require('../../controllers/website/user.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const { updateProfileValidator, changePasswordValidator, addressValidator } = require('../../validators/user.validator');

// All routes here require authentication
router.use(authMiddleware.protectWebsite);

/**
 * @swagger
 * tags:
 *   name: Website Users
 *   description: Customer Profile and Address Management
 */

/**
 * @swagger
 * /website/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Website Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /website/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Website Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 */
router.put('/profile', updateProfileValidator, userController.updateProfile);

/**
 * @swagger
 * /website/users/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Website Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Incorrect current password
 */
router.put('/change-password', changePasswordValidator, userController.changePassword);

/**
 * @swagger
 * /website/users/addresses:
 *   get:
 *     summary: Get user's addresses
 *     tags: [Website Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 */
router.get('/addresses', userController.getAddresses);

/**
 * @swagger
 * /website/users/addresses:
 *   post:
 *     summary: Add new address
 *     tags: [Website Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - house_number
 *               - street_address
 *               - city
 *               - postcode
 *             properties:
 *               house_number:
 *                 type: string
 *               street_address:
 *                 type: string
 *               city:
 *                 type: string
 *               county:
 *                 type: string
 *               postcode:
 *                 type: string
 *               country:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Validation error
 */
router.post('/addresses', addressValidator, userController.addAddress);

/**
 * @swagger
 * /website/users/addresses/{id}:
 *   put:
 *     summary: Update specific address
 *     tags: [Website Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               house_number:
 *                 type: string
 *               street_address:
 *                 type: string
 *               city:
 *                 type: string
 *               county:
 *                 type: string
 *               postcode:
 *                 type: string
 *               country:
 *                 type: string
 *               is_default:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 */
router.put('/addresses/:id', addressValidator, userController.updateAddress);

/**
 * @swagger
 * /website/users/addresses/{id}:
 *   delete:
 *     summary: Delete specific address
 *     tags: [Website Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */
router.delete('/addresses/:id', userController.deleteAddress);

module.exports = router;
