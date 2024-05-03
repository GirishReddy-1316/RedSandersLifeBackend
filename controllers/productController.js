const Product = require("../models/product");


exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ message: 'Error fetching product by ID' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { brandName, image, name, price, category, size, slug, desc } = req.body;

        if (!brandName || !image || !name || !price || !category || !size || !slug || !desc) {
            return res.status(400).json({ message: 'All required fields must be provided: brandName, image, name, price, category, size, slug, desc' });
        }

        const product = new Product(req.body);

        await product.save();

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        console.log(req.body)
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product' });
    }
};

exports.searchProducts = async (req, res) => {
    try {
        const keyword = req.query.search;
        if (!keyword) {
            return res.status(400).json({ message: 'Keyword is required for search' });
        }

        const products = await Product.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { category: { $regex: keyword, $options: 'i' } }
            ]
        });
        res.status(200).json(products);
    } catch (error) {
        console.error('Error searching for products:', error);
        res.status(500).json({ message: 'Error searching for products' });
    }
};

exports.insertProducts = async (req, res) => {
    try {

        const productsToInsert = req.body;
        const insertedProducts = await Product.insertMany([productsToInsert]);
        res.status(201).json({ message: 'Products inserted successfully' });
    } catch (error) {
        console.error('Error inserting products:', error);
        res.status(500).json({ message: 'Error inserting products' });
    }
};
