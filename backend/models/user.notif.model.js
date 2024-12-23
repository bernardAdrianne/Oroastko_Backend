//User notification model

import mongoose from "mongoose";

const notifSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserOrder',
        required: true,
    },
}, {
    timestamps: true,
});

const Notification = mongoose.model('Notification', notifSchema, 'user_notification');

export default Notification;