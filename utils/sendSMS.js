// sendSMS.js

const twilio = require('twilio');

const accountSid = 'your_account_sid';
const authToken = 'your_auth_token';
const client = twilio(accountSid, authToken);

const sendSMS = async (to, body) => {
    await client.messages.create({
        body,
        to,
        from: 'your_twilio_phone_number'
    });
};

module.exports = sendSMS;
