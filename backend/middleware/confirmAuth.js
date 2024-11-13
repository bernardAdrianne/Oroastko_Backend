import Blacklist from '../models/blacklist/blacklist.model.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.OROASTKO_SECRET || "oroastko_secret_key";

export const confirmAuthToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader ? authHeader.split(' ')[1] : req.cookies.authToken;
        
        if (!token) return res.status(403).json({ success: false, message: "No token provided." });

        const isBlacklisted = await Blacklist.findOne({ token });
        if (isBlacklisted) return res.status(403).json({ success: false, message: "Token has been logged out." });

        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        return res.status(401).json({ success: false, message: "Invalid or missing token." });
    }
};