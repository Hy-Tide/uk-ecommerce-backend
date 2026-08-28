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
/**
 * @swagger
 * /website/auth/logout:
 *   post:
 *     summary: Logout a customer
 *     tags: [Website Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /website/auth/forgot-password:
 *   post:
 *     summary: Request a password reset OTP
 *     tags: [Website Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset OTP sent to email
 *       404:
 *         description: User with this email not found
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /website/auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Website Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password has been reset successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /website/auth/verify-email:
 *   post:
 *     summary: Verify email using OTP
 *     tags: [Website Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/verify-email', authController.verifyEmail);

/**
 * @swagger
 * /website/auth/resend-otp:
 *   post:
 *     summary: Resend email verification OTP
 *     tags: [Website Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Email is already verified
 *       404:
 *         description: User not found
 */
router.post('/resend-otp', authController.resendOtp);

module.exports = router;
