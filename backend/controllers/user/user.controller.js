import User from '../../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Blacklist from '../../models/blacklist/blacklist.model.js';
import crypto from 'crypto';


function encrypt(text) {
    if (!process.env.AES_KEY) throw new Error("AES_KEY is undefined.");
    if (!text) throw new Error("Text to encrypt is undefined.");

    const key = Buffer.from(process.env.AES_KEY, 'base64');
    if (key.length !== 32) throw new Error("Invalid AES_KEY length. Expected 32 bytes.");

    const iv = crypto.randomBytes(16); 
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}

function decrypt(encryptedText, key, iv) {
    if (!key) throw new Error("AES_KEY is undefined.");
    if (!encryptedText || !iv) throw new Error("Encrypted data or IV is missing.");

    const decipher = crypto.createDecipheriv(
        'aes-256-cbc', 
        Buffer.from(key, 'base64'), 
        Buffer.from(iv, 'hex')
    );

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validatePhoneNumber = (phone) => {
    const regex = /^(?:\+63|0)(9\d{9})$/;
    return regex.test(phone);
};

//CUSTOMER REGISTRATION
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
        const { iv, encryptedData } = encrypt(password);
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists." });
        }

        // const saltRounds = 10;
        // const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ 
            username, 
            email, 
            password: encryptedData,
            iv: iv, 
        });
        
        await newUser.save();

        return res.status(201).json({ success: true, message: "User registered successfully."});
    } catch (error) {
        console.error("Error creating user:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//CUSTOMER LOGIN
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
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // const isPasswordMatch = await bcrypt.compare(password, user.password);
        // if (!isPasswordMatch) {
        //     return res.status(401).json({ success: false, message: "Invalid credentials." });
        // }

        const decryptedPassword = decrypt(user.password, process.env.AES_KEY, user.iv);
        if (password !== decryptedPassword) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

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

//CUSTOMER LOGOUT
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

//CUSTOMER VIEW PROFILE
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

//CUSTOMER EDIT AND UPDATE PROFILE
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
        // if (password) updateData.password = await bcrypt.hash(password, 10);

        if (password) {
            const { iv, encryptedData } = encrypt(password);
            updateData.password = encryptedData;
            updateData.iv = iv;
        }

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