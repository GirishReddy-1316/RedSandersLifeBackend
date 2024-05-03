
const express = require('express');
const productRouter = express.Router();
const productController = require('../controllers/productController');
const { adminAuth } = require('../middleware/admin.middleware');


productRouter.get('/search', productController.searchProducts);
productRouter.get('/', productController.getAllProducts);
productRouter.get('/:id', productController.getProductById);

productRouter.post('/', adminAuth, productController.createProduct);
productRouter.delete('/delete/:id', adminAuth, productController.deleteProduct);
productRouter.post('/update/:id', adminAuth, productController.updateProduct);
productRouter.post('/insert', adminAuth, productController.insertProducts);

module.exports = productRouter;
