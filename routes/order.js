const express = require('express');
const orderRouter = express.Router();
const orderController = require('../controllers/orderController');
const authenticateJWT = require('../middleware/authenticateJWT');

orderRouter.post('/create', authenticateJWT, orderController.createOrder);
// orderRouter.get('/get/:orderId', orderController.getOrdersByOrderId);
orderRouter.get('/get', authenticateJWT, orderController.getOrdersByUserId);
orderRouter.get('/get-all', orderController.getAllOrders);

orderRouter.post('/update/:orderId', authenticateJWT, orderController.updateOrderStatus);
orderRouter.delete('/delete/:orderId', authenticateJWT, orderController.deleteOrder);

module.exports = orderRouter;
