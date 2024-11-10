//review db model

import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: false,
        min: 1,
        max: 5
    },
    comments: {
        type: String,
        required: false,
    },
    response: {
        type: String,
        required: false,
    },
},
    {
        timestamps: true,
    }
);

const Feedback = mongoose.model('Feedback', feedbackSchema, 'feedbacks');

export default Feedback;
