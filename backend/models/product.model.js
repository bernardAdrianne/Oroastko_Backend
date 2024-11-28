//product db model

import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,   
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
},  
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema, 'products');

export default Product; 