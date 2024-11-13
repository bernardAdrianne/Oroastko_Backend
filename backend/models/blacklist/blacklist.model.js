// Blacklist model db

import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1h'
    }
});

const Blacklist = mongoose.model('Blacklist', blacklistSchema, 'blacklist');

export default Blacklist;