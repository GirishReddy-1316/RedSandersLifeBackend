const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    username: { type: String },
    phoneNumber: { type: String },
    googleId: { type: String },
    googleEmail: { type: String },
    otp: { type: Number },
    otpExpiry: { type: Date },
    accessToken: { type: String },
    profilePicture: { type: String },
    isGuest: { type: Boolean, default: false },
    razorpayId: { type: String },
    address: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
