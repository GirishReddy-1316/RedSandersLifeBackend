const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    brandName: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    desc: {
        type: String,
        required: true
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
