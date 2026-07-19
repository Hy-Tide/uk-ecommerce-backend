const { body } = require('express-validator');

exports.updateProfileValidator = [
    body('first_name').optional().trim().notEmpty().withMessage('First name cannot be empty'),
    body('last_name').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
    body('phone_number').optional().trim().matches(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/).withMessage('Please provide a valid phone number')
];

exports.changePasswordValidator = [
    body('oldPassword').notEmpty().withMessage('Please provide your current password'),
    body('newPassword').notEmpty().isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
];

exports.addressValidator = [
    body('house_number').notEmpty().trim().withMessage('Please provide a house number'),
    body('street_address').notEmpty().trim().withMessage('Please provide a street address'),
    body('city').notEmpty().trim().withMessage('Please provide a city'),
    body('county').optional().trim(),
    body('postcode').notEmpty().trim().withMessage('Please provide a postcode'),
    body('country').optional().trim(),
    body('is_default').optional().isBoolean().withMessage('is_default must be a boolean')
];
