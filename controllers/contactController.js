const Contact = require("../models/contact");
const sendContactDetailsEmail = require("../template/sendContactDetailsEmail");
const sendEmail = require("../utils/sendEmail");

exports.saveContactDetails = async (req, res) => {
    try {
        const { custName, email, mobile, message } = req.body;

        const contact = new Contact({
            custName,
            email,
            mobile,
            message
        });

        await contact.save();
        let paload = {
            custName,
            email,
            mobile,
            message
        }

        let emailMessage = sendContactDetailsEmail(paload);;

        await sendEmail(process.env.SMTP_EMAIL, 'Contact Details', emailMessage);

        res.status(201).json({ message: 'Contact details saved successfully' });
    } catch (error) {
        console.error('Error saving contact details:', error);
        res.status(500).json({ message: 'Error saving contact details' });
    }
};