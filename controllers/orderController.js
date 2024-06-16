const { default: mongoose } = require('mongoose');
const Order = require('../models/order');
const User = require('../models/user');
const GuestUser = require('../models/guest');
const sendEmail = require('../utils/sendEmail');
const createOrderConfirmationEmail = require('../template/sendingOrder');

exports.createOrder = async (req, res) => {
    try {
        const { products, totalPrice, shippingAddress, paymentMethod } = req.body;

        if (typeof totalPrice !== 'number' || totalPrice <= 0) {
            return res.status(400).json({ message: 'Total price must be a valid number greater than 0' });
        }

        if (!shippingAddress || typeof shippingAddress !== 'object' || Object.keys(shippingAddress).length === 0) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }

        // if (!paymentMethod) {
        //     return res.status(400).json({ message: 'Invalid payment method.' });
        // }
        let user = await User.findOne({ _id: req.userId });
        user.address = shippingAddress;
        user.save();

        const orderData = {
            customerId: req.userId,
            products,
            totalPrice,
            shippingAddress,
            paymentMethod,
            status: 'Placed'
        };

        const order = await Order.create(orderData);
        const orders = await Order.find({ customerId: req.userId, _id: order._id }).populate('products.productId', 'image name brandName price');
        const getHtmlResponse = createOrderConfirmationEmail(orders[0])
        await sendEmail(user.email, 'Order Details', getHtmlResponse);
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

        if (!paymentMethod) {
            return res.status(400).json({ message: 'Invalid payment method.' });
        }

        const lastGuestUser = await GuestUser.findOne().sort({ createdAt: -1 });
        const lastIdNumber = lastGuestUser ? parseInt(lastGuestUser.username.replace('Quest', '')) + 1 : 1;
        const newUsername = `Quest${lastIdNumber}`;

        guestUser = await GuestUser.create({
            username: newUsername,
            email: shippingAddress.email,
            isGuest: true,
            phoneNumber: shippingAddress.mobile,
            address: shippingAddress
        });

        const guestOrderData = {
            customerId: guestUser._id,
            products,
            totalPrice,
            shippingAddress,
            paymentMethod,
            status: 'Placed'
        };

        const guestOrder = await Order.create(guestOrderData);

        let orders = await Order.find({ customerId: guestUser._id, _id: guestOrder._id }).populate('products.productId', 'image name brandName price');
        orders[0].paymentMethod = paymentMethod;

        const getHtmlResponse = createOrderConfirmationEmail(orders[0]);

        await sendEmail(shippingAddress.email, 'Order Details', getHtmlResponse);

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
        const orders = await Order.find({ customerId: userId, status_type: "active" }).populate('products.productId', 'image name brandName price');
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
            orders = await Order.find({ _id: orderId, status_type: "active" }).populate('products.productId', 'image name brandName price');
            if (!orders || orders.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
        } else {
            orders = await Order.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $lookup: {
                        from: 'guestusers',
                        localField: 'customerId',
                        foreignField: '_id',
                        as: 'guestUser'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'products.productId',
                        foreignField: '_id',
                        as: 'productsOriginal'
                    }
                },
                {
                    $addFields: {
                        mergedCustomer: { $concatArrays: ["$user", "$guestUser"] }
                    }
                },
                {
                    $unwind: "$mergedCustomer"
                },
                {
                    $project: {
                        products: {
                            $map: {
                                input: "$productsOriginal",
                                as: "product",
                                in: {
                                    productId: "$$product._id",
                                    quantity: {
                                        $arrayElemAt: [
                                            "$products.quantity",
                                            { $indexOfArray: ["$products.productId", "$$product._id"] }
                                        ]
                                    },
                                    name: "$$product.name",
                                    brandName: "$$product.brandName",
                                    _id: {
                                        $arrayElemAt: [
                                            "$products._id",
                                            { $indexOfArray: ["$products.productId", "$$product._id"] }
                                        ]
                                    }
                                }
                            }
                        },
                        totalPrice: 1,
                        shippingAddress: 1,
                        paymentMethod: 1,
                        status: 1,
                        createdAt: 1,
                        "mergedCustomer.username": 1,
                        "mergedCustomer.email": 1,
                        "mergedCustomer.phoneNumber": 1
                    }
                }
            ]);
        }
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching orders' });
    }
};
exports.getOrdersByOrderId = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }
        const orders = await Order.find({ _id: orderId, status_type: "active" }).populate('products.productId', 'image name brandName price');
        res.status(200).json(orders);
    } catch (error) {
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
        const deletedOrder = await Order.findByIdAndUpdate(orderId, { status_type: 'deleted' });
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Error deleting order' });
    }
};
