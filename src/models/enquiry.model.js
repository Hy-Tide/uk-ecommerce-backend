const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email address is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    orderNumber: {
        type: String,
        trim: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    message: {
        type: String,
        required: [true, 'Message is required']
    },
    agree: {
        type: Boolean,
        required: [true, 'You must agree to the terms'],
        validate: {
            validator: function(v) {
                return v === true;
            },
            message: 'You must agree to the terms'
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Replied', 'Closed'],
        default: 'Pending'
    },
    replyMessage: {
        type: String
    },
    repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    },
    repliedAt: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
