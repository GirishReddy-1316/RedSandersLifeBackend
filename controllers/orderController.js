const Order = require('../models/order');
const User = require('../models/user');

exports.createOrder = async (req, res) => {
    try {
        const { products, totalPrice, shippingAddress, paymentMethod } = req.body;

        if (typeof totalPrice !== 'number' || totalPrice <= 0) {
            return res.status(400).json({ message: 'Total price must be a valid number greater than 0' });
        }

        if (!shippingAddress || typeof shippingAddress !== 'string' || shippingAddress.trim() === '') {
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

exports.getOrdersByUserId = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        const orders = await Order.find({ customerId: userId });
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
        const orders = await Order.find({ _id: orderId });
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
