// User model db

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: false,
    },
    address: {
        type: String, 
        required: false,    
    },
    phoneNumber: {
        type: Number,
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
        minlength: 15
    },
    userImage: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"]
    },
    iv: {
        type: String,
        required: true
    },
},
    {
        timestamps: true,
    }
);

const User = mongoose.model('User', userSchema, 'users');

export default User; 