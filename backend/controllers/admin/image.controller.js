import ProductImage from "../../models/admin/image.model.js";

// ADMIN ADD NEW IMAGE
export const addImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image file is required." });
        }

        const image = new ProductImage({
            productImage: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
        });

        await image.save()

        return res.status(200).json({ success: true, message: "Successfully added new image.", data: image });
    } catch (error) {
        console.error("Error adding image: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ADMIN VIEW ALL IMAGES
export const getImage = async (req, res) => {
    try {
        const images = await ProductImage.find().sort({_id:-1});

        if (!images || images.length === 0) {
            return res.status(404).json({ success: false, message: "No images found." });
        }
        const formattedImages = images.map(image => {
            if (!image.productImage || !image.productImage.data || !image.productImage.contentType) {
                console.warn(`Missing productImage or its properties for image ID: ${image._id}`);
                return null; // Skip invalid images
            }
            return {
                id: image._id,
                image: `data:${image.productImage.contentType};base64,${image.productImage.data.toString('base64')}`,
            };
        }).filter(Boolean); // Remove null values
        
        return res.status(200).json({ success: true, data: formattedImages });
        
    } catch (error) {
        console.error("Error fetching images: ", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// ADMIN DELETE IMAGE
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
