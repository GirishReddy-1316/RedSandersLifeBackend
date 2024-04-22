const mongoose = require('mongoose');

const guestUserSchema = new mongoose.Schema({
    username: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    address: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const GuestUser = mongoose.model('GuestUser', guestUserSchema);

module.exports = GuestUser;
