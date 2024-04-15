const jwt = require('jsonwebtoken');
exports.generateOTP = (length) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = Math.floor(min + Math.random() * (max - min + 1));

    return otp;
};

exports.generateToken = (userId, email) => {
    const payload = { userId, email };

    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
};