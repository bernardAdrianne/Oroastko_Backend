// Admin image management db

import mongoose from "mongoose";

const imageSchema = new mongoose.Schema ({
    productImage: {
        data: Buffer,
        contentType: String,
    },
},  {
    timestamps: true,
});


const ProductImage = mongoose.model('ProductImage', imageSchema);

export default ProductImage;