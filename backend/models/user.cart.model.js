// User Cart Model db

import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
}, { timestamps: true });

const userCartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    items: [cartItemSchema], 
}, {
    timestamps: true,
});

const UserCart = mongoose.model('UserCart', userCartSchema, 'user_carts');

export default UserCart;
