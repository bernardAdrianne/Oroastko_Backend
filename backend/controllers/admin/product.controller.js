import mongoose from 'mongoose';
import Product from '../../models/product.model.js';
import Category from '../../models/admin/admin.category.model.js';


export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({}).select('name price stock_quantity category');
        return res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getViewProduct = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id." });
    }

    try {
        const product = await Product.findById(id).select('name price stock_quantity image');
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }
        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("Error fetching product:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const createProduct = async (req, res) => {
    const { name, price, stock_quantity, image, category } = req.body;

    if (!name || !price || !stock_quantity || !image || !category) {
        return res.status(400).json({ success: false, message: "Please provide all the required fields." });
    }

    try {
        let categoryId = category;
        if (typeof category === "string" && !mongoose.Types.ObjectId.isValid(category)) {
            const categoryDoc = await Category.findOne({ name: category });
            if (!categoryDoc) {
                return res.status(404).json({ success: false, message: "Category not found." });
            }
            categoryId = categoryDoc._id;
        }

        const newProduct = new Product({ name, price, stock_quantity, image, category: categoryId });
        await newProduct.save();
        return res.status(201).json({ success: true, message: "Product added successfully.", data: newProduct });
    } catch (error) {
        console.error("Error adding new product:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;

    const product = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id." }); 
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(id, product, { new: true });
        return res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteProduct = async (req, res) => { 
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid Product Id." }); 
    }

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        return res.status(200).json({ success: true, message: "Product deleted successfully." });
    } catch (error) {
        console.error("Error deleting product:", error.message); 
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
