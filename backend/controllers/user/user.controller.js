import User from '../../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Blacklist from '../../models/blacklist/blacklist.model.js';

const JWT_SECRET = process.env.OROASTKO_SECRET || "oroastko_secret_key";

const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validatePhoneNumber = (phone) => {
    const regex = /^(?:\+63|0)(9\d{9})$/;
    return regex.test(phone);
};
//     const authHeader = req.headers['authorization'];
//     if (!authHeader) return res.status(403).json({ success: false, message: "No token provided." });

//     const token = authHeader.split(' ')[1];
//     if (!token) return res.status(403).json({ success: false, message: "No token found." });

//     const isBlacklisted = await Blacklist.findOne({ token });
//     if (isBlacklisted) return res.status(403).json({ success: false, message: "Token has been logged out." });

//     req.token = token;
//     next();
// };


export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username){
        return res.status(400).json({ success: false, message: "Please provide your username." });
    }
    if(!validateEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists." });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        return res.status(201).json({ success: true, message: "User registered successfully."});
    } catch (error) {
        console.error("Error creating user:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!validateEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format." });
    }
    if (!password) {
        return res.status(400).json({ success: false, message: "The password you entered is incorrect. Please try again." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found:", email);
            return res.status(404).json({ success: false, message: "User not found." });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

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

export const logoutUser = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader ? authHeader.split(' ')[1] : req.cookies.authToken;

        if (!token) return res.status(403).json({ success: false, message: "No token found for logging out." });

        const blacklistedToken = new Blacklist({ token });
        await blacklistedToken.save();

        res.clearCookie('authToken');
        return res.status(200).json({ success: true, message: "Logged out successfully." });
    } catch (error) {
        console.error("Error logging out user:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -role');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Error fetching user profile:", error.message);
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { username, address, phoneNumber, userImage, password } = req.body;
        const userId = req.user.userId;

        if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
            return res.status(400).json({ success: false, message: "Invalid phone number." });
        }
        if (password && password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (address) updateData.address = address;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (userImage) updateData.userImage = userImage;
        if (password) updateData.password = await bcrypt.hash(password, 10);

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        
        return res.status(200).json({ success: true, message: "Profile updated successfully.", data: updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};