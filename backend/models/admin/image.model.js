// Admin image management db

import mongoose from "mongoose";

const imageSchema = new mongoose.Schema ({
    productImage: {
        type: String,
        required: false,
    },
},  {
    timestamps: true,
});


const ProductImage = mongoose.model('ProductImage', imageSchema, 'admin_image');

export default ProductImage;