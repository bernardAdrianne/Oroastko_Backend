// Admin image management db

import mongoose from "mongoose";

const imageSchema = new mongoose.Schema ({
    productImage: {
        type: String,
        required: true,
    },
},  {
    timestamps: true,
});


const ProductImage = mongoose.model('ProductImage', imageSchema);

export default ProductImage;