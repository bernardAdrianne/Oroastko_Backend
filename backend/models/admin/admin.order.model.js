// Admin Order Management Model db

import mongoose from 'mongoose';

const adminOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        quantity: { 
            type: Number,
            required: true,
        },
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        enum: ['Order Confirmed', 'Preparing', 'Ready for pick-up', 'Received', 'Cancelled'],
        default: 'Order Confirmed',
    },
    managedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser',
        required: false,
    }
}, {
    timestamps: true,
});

const AdminOrder = mongoose.model('AdminOrder', adminOrderSchema, 'admin_orders');

export default AdminOrder;
