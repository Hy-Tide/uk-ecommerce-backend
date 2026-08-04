const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.titan.email',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'hello@grandmasbasket.co.uk',
        pass: process.env.SMTP_PASS || 'GrandmasBasket@2026#Hello',
    },
});

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version
 * @param {string} options.html - HTML version
 */
const sendEmail = async (options) => {
    const mailOptions = {
        from: `Grandmas Basket <${process.env.SMTP_FROM || 'hello@grandmasbasket.co.uk'}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = {
    sendEmail,
};
