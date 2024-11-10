import Product from '../../models/product.model.js';
import Category from '../../models/admin/admin.category.model.js';
import jwt from 'jsonwebtoken';
import Blacklist from '../../models/blacklist/blacklist.model.js';

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ success: false, message: "No token provided." });
    
    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: "Token not found." });

    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) return res.status(401).json({ success: false, message: "Token has been logged out." });
    
    req.token = token;
    next();
};

export const viewProducts = [verifyToken, async (req, res) => {    
    try {
        const decoded = jwt.verify(req.token, JWT_SECRET);
        const products = await Product.find({});
        
        if (!products.length) {
            return res.status(404).json({ success: true, message: "No products found." });
        }

        return res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}];

export const viewProduct = [verifyToken, async (req, res) => {
    try {
        const decoded = jwt.verify(req.token, JWT_SECRET);
        const { productId } = req.params;

        const product = await Product.findById(productId);

        if (!product) {
            console.log("Product not found for productId: ", productId);
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        return res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error("Error verifying token or fetching product:", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}];

export const searchProduct = [verifyToken, async (req, res) => {
    const { searchTerm } = req.query;
    if (!searchTerm) {
        return res.status(400).json({ success: false, message: "Search term is required." });
    }

    try {
        const decoded = jwt.verify(req.token, JWT_SECRET);
        const products = await Product.find({ name: { $regex: searchTerm, $options: "i" } });

        console.log("Found products:", products); 

        if (products.length === 0) {
            return res.status(404).json({ success: false, message: "No products found matching your search." });
        }

        return res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("Error searching product:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}];

export const filterProduct = [verifyToken, async (req, res) => {     
    const { name, maxPrice, minPrice, category: categoryName } = req.query;
    const filter = {};

    if (name) {
        filter.name = { $regex: name, $options: "i" };
    }

    if (maxPrice || minPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (categoryName) { 
        try {
            const category = await Category.findOne({ name: categoryName }).select('_id');
            if (category) {
                filter.category = category._id; 
            } else {
                return res.status(404).json({ success: false, message: "Category not found." });
            }
        } catch (error) {
            console.error("Error fetching category:", error);
            return res.status(500).json({ success: false, message: "Server error while fetching category." });
        }
    }

    try {
        const products = await Product.find(filter);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: "No products found matching the filters." });
        }

        return res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("Error filtering products:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}];
