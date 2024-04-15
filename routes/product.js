// routes/product.js

const express = require('express');
const productRouter = express.Router();
const productController = require('../controllers/productController');


productRouter.get('/products/search', productController.searchProducts);
productRouter.get('/products', productController.getAllProducts);
productRouter.get('/products/:id', productController.getProductById);
productRouter.post('/products', productController.createProduct);
productRouter.put('/products/:id', productController.updateProduct);
productRouter.delete('/products/:id', productController.deleteProduct);
productRouter.post('/products/insert', productController.insertProducts);

module.exports = productRouter;
