const express = require('express');
const adminRouter = express.Router();
const adminController = require('../controllers/admin.controller');
const { adminAuth } = require('../middleware/admin.middleware');

adminRouter.post('/login', adminController.adminLogin);
adminRouter.post('/forget-password', adminController.sendOTP);
adminRouter.post('/reset-password', adminController.resetPassword);
adminRouter.post('/logout', adminAuth, adminController.adminLogout);
adminRouter.post('/search', adminAuth, adminController.searchProducts);
adminRouter.get('/orderList', adminAuth, adminController.getOrdersList);
adminRouter.post('/users/create', adminController.createUser);
adminRouter.post('/create', adminController.createAdmin);
adminRouter.delete('/users/:id', adminAuth, adminController.deleteUser);
adminRouter.put('/users/:id', adminAuth, adminController.EditUser);
adminRouter.get('/customer-list', adminAuth, adminController.getUsers);


module.exports = adminRouter;