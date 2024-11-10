import AdminUser from '../../models/admin/admin.user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Blacklist from '../../models/blacklist/blacklist.model.js';

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; 

const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validatePhoneNumber = (phone) => {
    const regex = /^(?:\+63|0)(9\d{9})$/;
    return regex.test(phone);
};

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

export const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: "Please provide your name." });
    }
    if (!validateEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    try {
        const existingAdmin = await AdminUser.findOne({ email }); 

        if (existingAdmin) {
            return res.status(409).json({ success: false, message: "Admin already exists." });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newAdmin = new AdminUser({ name, email, password: hashedPassword });
        await newAdmin.save();

        const token = jwt.sign({ id: newAdmin._id, email: newAdmin.email, role: 'admin'},  JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json({ success: true, message: "Admin registered successfully.", token });
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

        const token = jwt.sign({ id: admin._id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ success: true, message: "Logged in successfully.", token });
    } catch (error) {
        console.error("Error logging in:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const logoutAdmin = [verifyToken, async (req,res) => {
    try {
        const blacklistedToken = new Blacklist({ token: req.token });
        await blacklistedToken.save();
    
        return res.status(200).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
        console.error("Error logging out admin:", error.message);
        return res.status(500).json({ success: false, message: "Server error." });
    }
}];  

export const getAdminProfile = [verifyToken, async (req, res) => {
    try {
        const decoded = jwt.verify(req.token, JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ success: false, message: "Invalid token." });
        }

        const admin = await AdminUser.findById(decoded.id).select('-password'); 

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        return res.status(200).json({ success: true, data: admin });
    } catch (error) {
        console.error("Error verifying or fetching admin profile:", error.message);
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
}];

export const updateAdminProfile = [verifyToken, async (req, res) => {
    try {
        const decoded = jwt.verify(req.token, JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ success: false, message: "Invalid token." });
        }

        const admin = decoded.id;

        const { name, phoneNumber, adminImage, password } = req.body;

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
}];
