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

router.route('/')
    .get(enquiryController.getAllEnquiries);

router.route('/:id')
    .get(enquiryController.getEnquiryById)
    .delete(enquiryController.deleteEnquiry);

router.patch('/:id/reply', enquiryController.replyToEnquiry);
router.patch('/:id/status', enquiryController.updateEnquiryStatus);

module.exports = router;
