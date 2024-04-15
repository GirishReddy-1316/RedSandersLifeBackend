const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    custName: {
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true
    },
    message: {
        type: String
    }
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
