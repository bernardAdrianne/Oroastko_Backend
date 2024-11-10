import UserCart from '../../models/user.cart.model.js';
import Product from '../../models/product.model.js';
import jwt from 'jsonwebtoken';
import Blacklist from '../../models/blacklist/blacklist.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ success: false, message: "No token provided." });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ success: false, message: "No token found." });

    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) return res.status(403).json({ success: false, message: "Token has been logged out." });

    req.token = token;
    next();
};

export const addtoCart = [verifyToken, async (req, res) => {
    try {
        const decoded = jwt.verify(req.token, JWT_SECRET);
        const userId = decoded.userId;
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found." });
        if (product.stock_quantity < quantity) return res.status(400).json({ success: false, message: "Insufficient stock available." });

        let userCart = await UserCart.findOne({ user: userId }) || new UserCart({ user: userId, items: [] });

        const existingCartItem = userCart.items.find(item => item.product.toString() === productId);
        if (existingCartItem) {
            existingCartItem.quantity += quantity;
        } else {
            userCart.items.push({ product: productId, quantity });
        }

        await userCart.save();
        return res.status(200).json({ success: true, message: "Product added to cart successfully.", data: userCart });
    } catch (error) {
        console.error("Error adding product to cart:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}];

export const updateItem = [verifyToken, async (req, res) => {
    try {
        const decoded = jwt.verify(req.token, JWT_SECRET);
        const userId = decoded.userId;
        const { productId, newQuantity } = req.body;

        if (newQuantity <= 0) return res.status(400).json({ success: false, message: "Quantity must be greater than 0." });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: "Product not found." });
        if (product.stock_quantity < newQuantity) return res.status(400).json({ success: false, message: "Insufficient stock available." });

        const userCart = await UserCart.findOne({ user: userId });
        if (!userCart) return res.status(404).json({ success: false, message: "Cart not found." });

        const existingCartItem = userCart.items.find(item => item.product.toString() === productId);
        if (!existingCartItem) return res.status(404).json({ success: false, message: "Product not found in cart." });

        existingCartItem.quantity = newQuantity;
        await userCart.save();

        return res.status(200).json({ success: true, message: "Cart item updated successfully.", data: userCart });
    } catch (error) {
        console.error("Error updating cart item:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}];

export const deleteItemtoCart = [verifyToken, async (req, res) => {
    try {
        const decoded = jwt.verify(req.token, JWT_SECRET);
        const userId = decoded.userId;
        const { productId } = req.body;

        const userCart = await UserCart.findOne({ user: userId });
        if (!userCart) return res.status(404).json({ success: false, message: "Cart not found." });

        const itemIndex = userCart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ success: false, message: "Product not found in cart." });

        userCart.items.splice(itemIndex, 1);
        await userCart.save();

        return res.status(200).json({ success: true, message: "Item deleted from cart successfully." });
    } catch (error) {
        console.error("Error deleting item from cart:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}];

export const viewCart = [verifyToken, async (req, res) => {
    try {
        const decoded = jwt.verify(req.token, JWT_SECRET);
        const userId = decoded.userId;

        const userCart = await UserCart.findOne({ user: userId }).populate('items.product');
        if (!userCart || userCart.items.length === 0) {
            return res.status(404).json({ success: false, message: "No items found in your cart." });
        }

        return res.status(200).json({ success: true, data: userCart });
    } catch (error) {
        console.error("Error fetching cart:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
}];
