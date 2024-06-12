const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    shippingAddress: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    paymentMethod: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ['Placed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Placed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    status_type: {
        type: String,
        default: 'active'
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
