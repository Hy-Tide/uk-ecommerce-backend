const Enquiry = require('../../models/enquiry.model');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.submitEnquiry = async (req, res, next) => {
    try {
        const { fullName, email, phoneNumber, orderNumber, subject, message, agree } = req.body;

        if (!agree) {
            return next(new ApiError(400, 'You must agree to the terms to submit an enquiry'));
        }

        const enquiry = await Enquiry.create({
            fullName,
            email,
            phoneNumber,
            orderNumber,
            subject,
            message,
            agree
        });

        res.status(201).json(new ApiResponse(201, { enquiry: { _id: enquiry._id, status: enquiry.status } }, 'Enquiry submitted successfully. We will get back to you soon.'));
    } catch (error) {
        next(error);
    }
};
