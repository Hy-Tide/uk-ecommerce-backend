const Enquiry = require('../../models/enquiry.model');
const emailService = require('../../services/email.service');
const ApiError = require('../../utils/ApiError');
const ApiResponse = require('../../utils/ApiResponse');

exports.getAllEnquiries = async (req, res, next) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { orderNumber: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const enquiries = await Enquiry.find(query)
            .populate('repliedBy', 'name email')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Enquiry.countDocuments(query);

        res.status(200).json(new ApiResponse(200, {
            enquiries,
            meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
        }, 'Enquiries retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.getEnquiryById = async (req, res, next) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id)
            .populate('repliedBy', 'name email');
            
        if (!enquiry) {
            return next(new ApiError(404, 'Enquiry not found'));
        }
        res.status(200).json(new ApiResponse(200, { enquiry }, 'Enquiry retrieved successfully'));
    } catch (error) {
        next(error);
    }
};

exports.replyToEnquiry = async (req, res, next) => {
    try {
        const { replyMessage } = req.body;
        if (!replyMessage) {
            return next(new ApiError(400, 'Reply message is required'));
        }

        const enquiry = await Enquiry.findById(req.params.id);
        if (!enquiry) {
            return next(new ApiError(404, 'Enquiry not found'));
        }

        // Send Email
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2>Re: ${enquiry.subject}</h2>
                <p>Dear ${enquiry.fullName},</p>
                <p>${replyMessage.replace(/\n/g, '<br>')}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 0.9em; color: #666;">
                    <strong>Your original message:</strong><br>
                    <em>${enquiry.message.replace(/\n/g, '<br>')}</em>
                </p>
            </div>
        `;

        await emailService.sendEmail({
            to: enquiry.email,
            subject: `Re: ${enquiry.subject}`,
            text: replyMessage,
            html: emailHtml
        });

        // Update DB
        enquiry.replyMessage = replyMessage;
        enquiry.repliedBy = req.user._id; // Admin user
        enquiry.repliedAt = new Date();
        enquiry.status = 'Replied';
        await enquiry.save();

        res.status(200).json(new ApiResponse(200, { enquiry }, 'Reply sent successfully'));
    } catch (error) {
        next(error);
    }
};

exports.updateEnquiryStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Replied', 'Closed'].includes(status)) {
            return next(new ApiError(400, 'Invalid status value'));
        }

        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).populate('repliedBy', 'name email');

        if (!enquiry) {
            return next(new ApiError(404, 'Enquiry not found'));
        }

        res.status(200).json(new ApiResponse(200, { enquiry }, 'Enquiry status updated successfully'));
    } catch (error) {
        next(error);
    }
};

exports.deleteEnquiry = async (req, res, next) => {
    try {
        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
        if (!enquiry) {
            return next(new ApiError(404, 'Enquiry not found'));
        }
        res.status(200).json(new ApiResponse(200, null, 'Enquiry deleted successfully'));
    } catch (error) {
        next(error);
    }
};
