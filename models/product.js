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
        type: String,
        default: false
    },
    slug: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        required: true
    },
    additionalBulletPoints: {
        type: [{
            heading: { type: String, default: "" },
            description: { type: String, default: "" }
        }],
    },
    isProductReady: {
        type: Boolean,
        default: true
    },
    ingredients: {
        type: String,
    }

});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
