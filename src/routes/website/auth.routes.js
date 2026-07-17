const express = require('express');
const router = express.Router();
const authController = require('../../controllers/website/auth.controller');

/**
 * @swagger
 * tags:
 *   name: Website Auth
 *   description: Authentication for customers (website)
 */

/**
 * @swagger
 * /website/auth/register:
 *   post:
 *     summary: Register a new customer
 *     tags: [Website Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone_number:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already in use or validation error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /website/auth/login:
 *   post:
 *     summary: Login for customers
 *     tags: [Website Auth]
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
 *         description: Login successful
 *       401:
 *         description: Incorrect email or password
 */
router.post('/login', authController.login);

module.exports = router;
