const Contact = require("../models/contact");
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

        // Send email notification to admin
        await sendEmail(process.env.SMTP_EMAIL, 'New Contact Details', `Name: ${custName}\nEmail: ${email}\nMobile: ${mobile}\nMessage: ${message}`);

        res.status(201).json({ message: 'Contact details saved successfully' });
    } catch (error) {
        console.error('Error saving contact details:', error);
        res.status(500).json({ message: 'Error saving contact details' });
    }
};