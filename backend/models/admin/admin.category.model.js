// Admin Category Management

import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema ({
    categoryName: {
        type: String,
        required: true,

    },
},
    {
        timestamps: true,
    }
);

const Category = mongoose.model('Category', categorySchema, 'category');

export default Category;