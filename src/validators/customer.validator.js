const { body } = require('express-validator');

exports.updateCustomerValidator = [
    body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('email').optional().trim().isEmail().withMessage('Please provide a valid email'),
    body('phone_number').optional().trim().matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).withMessage('Please provide a valid phone number')
];

exports.updateStatusValidator = [
    body('status').notEmpty().withMessage('Status is required').isIn(['Active', 'Inactive']).withMessage('Invalid status')
];
