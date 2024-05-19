const bcrypt = require('bcrypt');
const User = require('../models/user');
const sendEmail = require('../utils/sendEmail');
const { generate_OTP, generateToken } = require('../utils/generateOTP');

// Temporary storage for OTPs and their expiry times
let otpStorage = {};

exports.generateOTP = async (req, res) => {
    try {
        const { email, phoneNumber } = req.body;

        // Check if the email or phone number already exists in the database
        const existingUser = await User.findOne({ $or: [{ email: { $regex: '^' + email + '$', $options: '' } }, { phoneNumber }] });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const otp = generate_OTP(4);
        const otpExpiry = new Date(Date.now() + 10 * 60000); // Set OTP expiry (e.g., 10 minutes)

        otpStorage[email] = { otp, expiry: otpExpiry };
        otpStorage[phoneNumber] = { otp, expiry: otpExpiry };

        await sendEmail(email, 'Verification OTP', `Your OTP for verification is: ${otp}`);

        // await sendSMS(phoneNumber, `Your OTP for verification is: ${otp}`);

        res.status(200).json({ message: 'OTP generated and sent successfully', otp: otp });
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ message: 'Error generating OTP' });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, phoneNumber, otp } = req.body;
        const storedOtpDataByEmail = otpStorage[email];
        const storedOtpDataByPhoneNumber = otpStorage[phoneNumber];

        if (!storedOtpDataByEmail || !storedOtpDataByPhoneNumber) {
            return res.status(400).json({ message: 'OTP not found' });
        }

        const storedOtp = storedOtpDataByEmail.otp;
        const storedOtpExpiry = storedOtpDataByEmail.expiry;
        if (storedOtp !== Number(otp) || storedOtpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ message: 'Error verifying OTP' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username = "", phoneNumber, password, email } = req.body;

        const emailVerified = otpStorage[email];
        const phoneNumberVerified = otpStorage[phoneNumber];
        console.log(emailVerified, phoneNumberVerified)

        if (!emailVerified || !phoneNumberVerified) {
            return res.status(400).json({ message: 'Email or phone number not verified' });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (existingUser && existingUser.googleEmail && existingUser.googleEmail === email) {
            return res.status(400).json({ message: 'Please continue with Google login as your account was created using Google' });
        }
        if (existingUser) {
            return res.status(400).send({ message: 'email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, phoneNumber, password: hashedPassword, email });
        await user.save();
        delete otpStorage[email];
        delete otpStorage[phoneNumber];
        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error creating user', error: error.message });
    }
};

// Login user
exports.loginUser = async (req, res) => {
    try {
        const { emailOrPhone, password, username = "" } = req.body;
        const user = await User.findOne({ $or: [{ email: { $regex: '^' + emailOrPhone + '$', $options: 'i' } }, { phoneNumber: emailOrPhone }] });
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        if (user.googleEmail && user.googleEmail === emailOrPhone) {
            return res.status(400).json({ message: 'Please continue with Google login as your account was created using Google' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).send({ message: 'Invalid password' });
        }
        delete user.password;
        const token = generateToken(user._id, user.email);
        user.accessToken = token;
        await user.save();
        const formattedUser = {
            _id: user._id,
            email: user.email,
            phoneNumber: user.phoneNumber,
            googleEmail: user.googleEmail,
            profilePicture: user.profilePicture,
            address: user.address,
            username: user.username
        };
        res.status(200).send({ user: formattedUser, token });
    } catch (error) {

        res.status(500).send({ message: 'Error logging in', error: error.message });
    }
};
``
// google profile
exports.createProfile = async (req, res) => {
    try {
        const { id, emails } = req.user;
        const googleEmail = emails[0].value;
        const user = await User.findOne({ email: googleEmail });
        if (!user) {
            const newUser = new User({ email: googleEmail, googleId: id, googleEmail });
            await newUser.save();
            const token = generateToken(id, googleEmail);
            const formattedUser = {
                _id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                googleEmail: newUser.googleEmail
            };
            return res.status(200).json({ user: formattedUser, token });
        } else {
            if (!user.googleId) user.googleId = id;
            if (!user.googleEmail) user.googleEmail = googleEmail;
            await user.save();
            const token = generateToken(id, googleEmail);
            const formattedUser = {
                _id: user._id,
                email: user.email,
                username: user.username,
                googleEmail: user.googleEmail
            };
            return res.status(200).json({ user: formattedUser, token });
        }
    } catch (error) {
        console.error('Error saving user data:', error);
        return res.status(500).send('Failed to save user data');
    }
}

exports.getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        console.log("userId: " + typeof (userId), userId);

        const user = await User.findById(userId);

        if (user) {
            const formattedUser = {
                _id: user._id,
                email: user.email,
                username: user.username,
                googleEmail: user.googleEmail,
                profilePicture: user.profilePicture,
                address: user.address
            };
            res.status(200).json({ user: formattedUser, token: user.accessToken });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user data:', error);
        res.status(500).send('Failed to retrieve user data');
    }
};


exports.sendOTP = async (req, res) => {
    try {
        const { email, phone } = req.body;
        const user = await User.findOne({ $or: [{ email: { $regex: '^' + email + '$', $options: '' } }, { phoneNumber: phone }] });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }


        if (user && user.googleEmail && user.googleEmail === email) {
            return res.status(400).json({ message: 'Please continue with Google login as your account was created using Google' });
        }

        const otp = generate_OTP(4);
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60000);
        await user.save();

        await sendEmail(user.email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}`);

        res.status(200).json({ message: 'OTP sent successfully', otp });
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ message: 'Error generating OTP' });
    }
};

exports.verifyPasswordOTP = async (req, res) => {
    try {
        const { email, phone, otp } = req.body;
        const user = await User.findOne({ $or: [{ email: { $regex: '^' + email + '$', $options: '' } }, { phoneNumber: phone }] });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log(user, otp, typeof (otp));

        if (user && user.googleEmail && user.googleEmail === email) {
            return res.status(400).json({ message: 'Please continue with Google login as your account was created using Google' });
        }

        if (user.otp !== Number(otp) || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        res.status(200).json({ message: 'OTP verify successful' });
    } catch (error) {
        console.error('Error Otp verify:', error);
        res.status(500).json({ message: 'Error Otp verify' });
    }
}


exports.resetPassword = async (req, res) => {
    try {
        const { EmailOrPhone, password } = req.body;
        const user = await User.findOne({ $or: [{ email: { $regex: '^' + EmailOrPhone + '$', $options: 'i' } }, { phoneNumber: EmailOrPhone }] });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving users', error: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving user', error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.accessToken = null;
        await user.save();

        return res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error logging out:', error);
        return res.status(500).json({ message: 'Error logging out', error: error.message });
    }
};


// Update user by ID
exports.updateUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        // Hash the password if it's being updated
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }
        if (username) user.username = username;
        if (email) user.email = email;
        await user.save();
        res.status(200).send({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error updating user', error: error.message });
    }
};

// Delete user by ID
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }
        await User.deleteOne({ _id: req.params.id });
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Error deleting user', error: error.message });
    }
};
