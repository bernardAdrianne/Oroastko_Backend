// Admin Model db

import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: Number,
        required: false,
    },
    adminImage: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    iv: { 
        type: String, 
        required: true 
    }, 
}, {
    timestamps: true,
});

const AdminUser = mongoose.model('AdminUser', adminUserSchema, 'admin_users');

export default AdminUser;