const { default: mongoose } = require('mongoose');
const Order = require('../models/order');
const User = require('../models/user');

exports.createOrder = async (req, res) => {
    try {
        const { products, totalPrice, shippingAddress, paymentMethod } = req.body;

        if (typeof totalPrice !== 'number' || totalPrice <= 0) {
            return res.status(400).json({ message: 'Total price must be a valid number greater than 0' });
        }

        if (!shippingAddress || typeof shippingAddress !== 'object' || Object.keys(shippingAddress).length === 0) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        const allowedPaymentMethods = ['Credit Card', 'Debit Card', 'Net Banking', 'COD'];
        if (!paymentMethod || !allowedPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({ message: 'Invalid payment method. Allowed options are: Credit Card, Debit Card, Net Banking, COD' });
        }

        await User.findByIdAndUpdate(req.userId, { address: req.body.shippingAddress });

        const orderData = {
            customerId: req.userId,
            products,
            totalPrice,
            shippingAddress,
            paymentMethod,
            status: 'Placed'
        };

        const order = await Order.create(orderData);
        res.status(201).json({ orderId: order._id });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
};

exports.createGuestOrder = async (req, res) => {
    try {
        const { products, totalPrice, shippingAddress, paymentMethod } = req.body;

        if (typeof totalPrice !== 'number' || totalPrice <= 0) {
            return res.status(400).json({ message: 'Total price must be a valid number greater than 0' });
        }

        if (!shippingAddress || typeof shippingAddress !== 'object' || Object.keys(shippingAddress).length === 0) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        const allowedPaymentMethods = ['Credit Card', 'Debit Card', 'Net Banking', 'COD'];
        if (!paymentMethod || !allowedPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({ message: 'Invalid payment method. Allowed options are: Credit Card, Debit Card, Net Banking, COD' });
        }

        let guestUser = await User.findOne({ email: shippingAddress.email, isGuest: true });
        if (!guestUser) {
            const lastGuestUser = await User.findOne({ isGuest: true }).sort({ createdAt: -1 });
            const lastIdNumber = lastGuestUser ? parseInt(lastGuestUser.username.replace('Quest', '')) + 1 : 1;
            const newUsername = `Quest${lastIdNumber}`;

            guestUser = await User.create({
                username: newUsername,
                email: shippingAddress.email,
                isGuest: true,
                phoneNumber: shippingAddress.mobile,
                address: shippingAddress
            });
        }
        await User.findByIdAndUpdate(guestUser._id, { address: shippingAddress });
        const guestOrderData = {
            customerId: guestUser._id,
            products,
            totalPrice,
            shippingAddress,
            paymentMethod,
            status: 'Placed'
        };
        const guestOrder = await Order.create(guestOrderData);
        res.status(201).json({ orderId: guestOrder._id });
    } catch (error) {
        console.error('Error creating guest order:', error);
        res.status(500).json({ message: 'Error creating guest order' });
    }
};

exports.getOrdersByUserId = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        console.log(userId);
        const orders = await Order.find({ customerId: userId }).populate('products.productId', 'name brandName');
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        let orders;
        if (orderId) {
            const isValidObjectId = mongoose.Types.ObjectId.isValid(orderId);
            if (!isValidObjectId) {
                return res.status(400).json({ message: 'Invalid orderId format' });
            }
            orders = await Order.find({ _id: orderId }).populate('products.productId', 'name brandName');
            if (!orders || orders.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
        } else {
            orders = await Order.find({}).populate('products.productId', 'name brandName');
        }
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};
exports.getOrdersByOrderId = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }
        const orders = await Order.find({ _id: orderId }).populate('products.productId', 'name brandName');
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const { status } = req.body;
        if (!orderId || !status) {
            return res.status(400).json({ message: 'Order ID and status are required' });
        }
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Error deleting order' });
    }
};
