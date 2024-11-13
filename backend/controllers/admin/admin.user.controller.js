import mongoose from 'mongoose';
import User from '../../models/user.model.js';


export const viewUsers = async (req,res) => {
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
};

export const viewUser = async (req,res) => {
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
};

export const deleteUser = async (req,res) => {
    
};