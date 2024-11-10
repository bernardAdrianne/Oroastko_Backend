import mongoose from 'mongoose';
import User from '../../models/user.model.js';
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

export const viewUsers = [verifyToken, async (req,res) => {
    try {
        const myUsers = await User.find().select('-password -email -role');

        if (!myUsers || myUsers.length === 0) {
            return res.status(404).json({ success: false, message: "No customers found." });
        }

        return res.status(200).json({ success: true, data: myUsers });
    } catch (error) {
        console.error("Error fetching customers", error.message); 
        return res.status(500).json({ success: false, message: "Server error" });
    }
}];

export const viewUser = [verifyToken, async (req,res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid customer Id." });
    }

    try {
        const myUser = await User.findById(id).select('fullname address phoneNumber userImage');

        if (!myUser) {
            return res.status(404).json({ success: false, message: "Customer not found." });
        }

        return res.status(200).json({ succes: true, data: myUser });
    } catch (error) {
        console.error("Error fetching customer:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
}];

export const deleteUser = [verifyToken, async (req,res) => {
    
}];