const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/auth.controller');
const { protectAdmin } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Auth
 *   description: Authentication for admin panel
 */

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Login for admins
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin login successful
 *       401:
 *         description: Incorrect email or password
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /admin/auth/create:
 *   post:
 *     summary: Create a new admin user
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *       400:
 *         description: Email already in use
 */
router.post('/create', protectAdmin, authController.create);

module.exports = router;
