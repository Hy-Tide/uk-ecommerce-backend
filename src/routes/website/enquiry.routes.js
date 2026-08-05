const express = require('express');
const router = express.Router();
const enquiryController = require('../../controllers/website/enquiry.controller');

/**
 * @swagger
 * tags:
 *   name: Website Contact
 *   description: Contact form submissions
 */

router.post('/', enquiryController.submitEnquiry);

module.exports = router;
