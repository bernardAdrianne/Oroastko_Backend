import ProductImage from "../../models/admin/image.model.js";
import path from 'path';

// ADMIN ADD NEW IMAGE
export const addImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image file is required." });
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        const newImage = new ProductImage({ productImage: imageUrl });
        await newImage.save();

        return res.status(201).json({ success: true, message: "Image added successfully.", data: newImage });
    } catch (error) {
        console.error("Error adding image: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ADMIN VIEW ALL IMAGE
export const getImage = async (req, res) => {
    try {
        const images = await ProductImage.find();

        if (!images || images.length === 0) {
            return res.status(404).json({ success: false, message: "No images found." });
        }

        const formattedImages = images.map(image => ({
            id: image._id,
            image: `http://localhost:5000/uploads/${path.basename(image.productImage)}`
        }));

        return res.status(200).json({ success: true, data: formattedImages });
    } catch (error) {
        console.error("Error fetching images: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//ADMIN DELETE IMAGE
export const deleteImage = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Image ID is required." });
        }

        const image = await ProductImage.findByIdAndDelete(id);

        if (!image) {
            return res.status(404).json({ success: false, message: "Image not found." });
        }

        return res.status(200).json({ success: true, message: "Image deleted successfully." });
    } catch (error) {
        console.error("Error deleting image: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
