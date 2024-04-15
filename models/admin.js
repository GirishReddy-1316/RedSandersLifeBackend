const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String },
    otp: { type: Number },
    otpExpiry: { type: Date },
    accessToken: { type: String },
    profilePicture: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;