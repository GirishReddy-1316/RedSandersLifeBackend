
const Admin = require('../models/admin');
const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { generateToken, generate_OTP } = require('../utils/generateOTP');
const sendEmail = require('../utils/sendEmail');

exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email: { $regex: '^' + email + '$', $options: 'i' } });

        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = generateToken(admin._id, admin.email);
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error logging in admin:', error);
        res.status(500).json({ message: 'Error logging in admin' });
    }
};

exports.adminLogout = async (req, res) => {
    try {
        const adminId = req.adminId;
        await Admin.findByIdAndUpdate(adminId, { accessToken: null });
        res.status(200).json({ message: 'Admin logout successful' });
    } catch (error) {
        console.error('Error logging out admin:', error);
        res.status(500).json({ message: 'Error logging out admin' });
    }
};

exports.sendOTP = async (req, res) => {
    console.log(req.body);
    try {
        const { email } = req.body; // Destructure email from req.body
        if (!email) {
            return res.status(400).json({ message: 'Invalid Input' });
        }
        const admin = await Admin.findOne({ email: { $regex: '^' + email + '$', $options: 'i' } });
        if (!admin) {
            return res.status(401).json({ message: 'Admin not found' });
        }

        const otp = generate_OTP(4);
        admin.otp = otp;
        admin.otpExpiry = new Date(Date.now() + 10 * 60000);
        await admin.save();

        await sendEmail(admin.email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}`);

        res.status(200).json({ message: 'OTP sent successfully', otp });
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ message: 'Error generating OTP' });
    }
};


exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        const admin = await Admin.findOne({ email: { $regex: '^' + email + '$', $options: 'i' } });

        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        if (admin.otp !== Number(otp) || admin.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        admin.otp = null;
        admin.otpExpiry = null;

        const hashedPassword = await bcrypt.hash(password, 10);
        admin.password = hashedPassword;
        await admin.save();

        res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const keyword = req.query.search;

        if (!keyword) {
            return res.status(400).json({ message: 'Keyword is required for search' });
        }

        const products = await Product.find({ $text: { $search: keyword } }, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .lean(); // Convert Mongoose documents to plain JavaScript objects

        // Custom sorting to prioritize exact matches
        products.sort((a, b) => {
            const aMatch = a.name.toLowerCase().includes(keyword.toLowerCase());
            const bMatch = b.name.toLowerCase().includes(keyword.toLowerCase());
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
        });

        res.status(200).json(products);
    } catch (error) {
        console.error('Error searching for products:', error);
        res.status(500).json({ message: 'Error searching for products' });
    }
};

exports.getOrdersList = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('customerId', 'username email phoneNumber address').sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};


exports.createAdmin = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).send({ message: 'email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = new Admin({ username, email, password: hashedPassword });

        await admin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Error creating admin' });
    }
};

exports.createUser = async (req, res) => {
    try {
        const { username = "", phoneNumber, password, email } = req.body;

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
        res.status(201).send({ message: 'User created successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'Error creating user', error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}, {
            username: 1,
            email: 1,
            phoneNumber: 1,
            googleEmail: 1,
            address: 1,
            password: 1,
            createdAt: 1
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).send({ message: 'Error retrieving users', error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error deleting user', error: error.message });
    }
};


exports.EditUser = async (req, res) => {
    const userId = req.params.id;
    const { username, email, phoneNumber, address } = req.body;  // assuming fields to update
    try {
        console.log(req.body);
        const updatedUser = await User.findByIdAndUpdate(userId, { username, email }, { new: true });
        if (!updatedUser) {
            return res.status(404).send({ message: 'User not found' });
        }
        res.status(200).send({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
        res.status(500).send({ message: 'Error updating user', error: error.message });
    }
};