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
    stock_quantity: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        reference: 'Category',
        required: true,
    },
},  
    {
        timestamps: true, //createdAt, updatedAt
    }
);

const Product = mongoose.model('Product', productSchema, 'products');

export default Product; 