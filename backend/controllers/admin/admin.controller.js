import AdminUser from '../../models/admin/admin.user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Blacklist from '../../models/blacklist/blacklist.model.js';
import crypto from 'crypto';

const encrypt = (text) => {
    try {
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.AES_KEY, 'hex'), Buffer.from(process.env.AES_IV, 'hex'));
        console.log("Cipher created successfully:", cipher); 

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        return encrypted;
    } catch (error) {   
        console.error("Encryption error:", error.message);
        throw error;
    }
};

const decrypt = (encryptedText) => {
    try { 
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.AES_KEY, 'hex'), Buffer.from(process.env.AES_IV, 'hex'));
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
    } catch (error) {
        console.error("Decryption error:", error.message);
        throw error;
    }
};

const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validatePhoneNumber = (phone) => {
    const regex = /^(?:\+63|0)(9\d{9})$/;
    return regex.test(phone);
};

export const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: "Please provide your name." });
    }
    if (!email || !validateEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    try {
        const encryptedEmail = encrypt(email);
        const existingAdmin = await AdminUser.findOne({ email: encryptedEmail }); 

        if (existingAdmin) {
            return res.status(409).json({ success: false, message: "Admin already exists." });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newAdmin = new AdminUser({ 
            name, 
            email: encryptedEmail,
            password: hashedPassword,
        });
        
        await newAdmin.save();

        return res.status(201).json({ success: true, message: "Admin registered successfully." });
    } catch (error) {
        console.error("Error creating admin:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!validateEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
    }
    if (!password) {
        return res.status(400).json({ success: false, message: "The password you entered is incorrect. Please try again." });
    }

    try {
        const admin = await AdminUser.findOne({ email });
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const token = jwt.sign({ id: admin._id, email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.MODE_ENV === 'production',
            maxAge: 60 * 60 * 1000 
        });

        return res.status(200).json({ success: true, message: "Logged in successfully.", token });
    } catch (error) {
        console.error("Error logging in:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const logoutAdmin = async (req,res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader ? authHeader.split(' ')[1] : req.cookies.authToken;

        if (!token) return res.status(403).json({ success: false, message: "No token found for logging out." });

        const blacklistedToken = new Blacklist({ token });
        await blacklistedToken.save();

        res.clearCookie('authToken');
        return res.status(200).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
        console.error("Error logging out admin:", error.message);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};  

export const getAdminProfile = async (req, res) => {
    try {
        const admin = await AdminUser.findById(req.admin.adminId).select('-password'); 
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        return res.status(200).json({ success: true, data: admin });
    } catch (error) {
        console.error("Error verifying or fetching admin profile:", error.message);
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

export const updateAdminProfile = async (req, res) => {
    try {
        const { name, phoneNumber, adminImage, password } = req.body;
        const admin = req.admin.adminId;

        if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({ success: false, message: "Invalid phone number." });
        }
        if (password && password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (adminImage) updateData.adminImage = adminImage;
        if (password) updateData.password = await bcrypt.hash(password, 10);

        const updatedAdmin = await AdminUser.findByIdAndUpdate(admin, updateData, { new: true });
        if (!updatedAdmin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        return res.status(200).json({ success: true, message: "Profile updated successfully.", data: updatedAdmin });
    } catch (error) {
        console.error("Error updating admin:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
