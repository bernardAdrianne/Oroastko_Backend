// User Order Model db

import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
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
    price: {
        type: Number,
        required: true,
    },
}, { timestamps: true });

const userOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
    },
    userStatus: {
        type: String,
        enum: ['Pending', 'Order Confirmed', 'Preparing', 'Order Recieved'],
        default: 'Pending',
    },
}, {
    timestamps: true,
});

const UserOrder = mongoose.model('UserOrder', userOrderSchema, 'user_orders');

export default UserOrder;
