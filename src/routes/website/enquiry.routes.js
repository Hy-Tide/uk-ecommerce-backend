const express = require('express');
const router = express.Router();
const enquiryController = require('../../controllers/website/enquiry.controller');

/**
 * @swagger
 * tags:
 *   name: Website Contact
 *   description: Contact form submissions
 */

/**
 * @swagger
 * /website/contact:
 *   post:
 *     summary: Submit a new contact form enquiry
 *     tags: [Website Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phoneNumber
 *               - subject
 *               - message
 *               - agree
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               orderNumber:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *               agree:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Enquiry submitted successfully
 */
router.post('/', enquiryController.submitEnquiry);

module.exports = router;
