const nodemailer = require('nodemailer');
const logger = require('./logger');

const mailTransporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

mailTransporter.verify((error, success) => {
    if (error) {
        logger.error('Mail Configuration Error: ', error);
    } else {
        logger.info('Mail Server is ready to take our messages');
    }
});

module.exports = mailTransporter;
