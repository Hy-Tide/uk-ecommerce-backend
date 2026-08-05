const express = require('express');
const router = express.Router();
const enquiryController = require('../../controllers/admin/enquiry.controller');
const authMiddleware = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Admin Enquiries
 *   description: Contact form enquiry management for admins
 */

router.use(authMiddleware.protectAdmin);

/**
 * @swagger
 * /admin/enquiries:
 *   get:
 *     summary: Get all enquiries
 *     tags: [Admin Enquiries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Enquiries retrieved successfully
 */
router.route('/')
    .get(enquiryController.getAllEnquiries);

/**
 * @swagger
 * /admin/enquiries/{id}:
 *   get:
 *     summary: Get enquiry by ID
 *     tags: [Admin Enquiries]
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
 *         description: Enquiry retrieved successfully
 *   delete:
 *     summary: Delete an enquiry
 *     tags: [Admin Enquiries]
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
 *         description: Enquiry deleted successfully
 */
router.route('/:id')
    .get(enquiryController.getEnquiryById)
    .delete(enquiryController.deleteEnquiry);

/**
 * @swagger
 * /admin/enquiries/{id}/reply:
 *   patch:
 *     summary: Reply to an enquiry
 *     tags: [Admin Enquiries]
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
 *               replyMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply sent successfully
 */
router.patch('/:id/reply', enquiryController.replyToEnquiry);

/**
 * @swagger
 * /admin/enquiries/{id}/status:
 *   patch:
 *     summary: Update enquiry status
 *     tags: [Admin Enquiries]
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
 *               status:
 *                 type: string
 *                 enum: [Pending, Replied, Closed]
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.patch('/:id/status', enquiryController.updateEnquiryStatus);

module.exports = router;
