const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, text) => {
    try {
        if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
            throw new Error('SMTP_EMAIL or SMTP_PASSWORD environment variables are not provided');
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_SERVER,
            port: 587,
            auth: {
                user: process.env.SMTP_USER_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.SMTP_EMAIL,
            to,
            subject,
            text,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                throw new Error('Failed to send email');
            }
            console.log('Email sent successfully:', info.response);
        });

    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

module.exports = sendEmail;
