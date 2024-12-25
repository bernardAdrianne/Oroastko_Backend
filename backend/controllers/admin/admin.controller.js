import AdminUser from '../../models/admin/admin.user.model.js';
// import bcrypt from 'bcrypt';
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

//ADMIN REGISTRATION
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
        const { iv, encryptedData } = encrypt(password);
        const existingAdmin = await AdminUser.findOne({ email }); 

        if (existingAdmin) {
            return res.status(409).json({ success: false, message: "Admin already exists." });
        }

        // const saltRounds = 10;
        // const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newAdmin = new AdminUser({ 
            name, 
            email,
            password: encryptedData,
            iv: iv,
        });
  
        await newAdmin.save();

        return res.status(201).json({ success: true, message: "Admin registered successfully." });
    } catch (error) {
        console.error("Error creating admin:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//ADMIn LOGIN
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

        // const isPasswordValid = await bcrypt.compare(password, admin.password);
        // if (!isPasswordValid) {
        //     return res.status(401).json({ success: false, message: "Invalid credentials." });
        // }

        const decryptedPassword = decrypt(admin.password, process.env.AES_KEY, admin.iv);
        if (password !== decryptedPassword) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }
        // console.log(decryptedPassword);
        const token = jwt.sign({ id: admin._id, email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: process.env.MODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({ success: true, message: "Logged in successfully.", token });
    } catch (error) {
        console.error("Error logging in:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

//ADMIN LOGOUT
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

//ADMIN VIEW PROFILE
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await AdminUser.findById(req.admin.id).select('-password');
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        return res.status(200).json({ success: true, data: admin });
    } catch (error) {
        console.error("Error verifying or fetching admin profile:", error.message);
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

//ADMIN EDIT AND UPDATE PROFILE
export const updateAdminProfile = async (req, res) => {
    try {
        const { name, phoneNumber, adminImage, password } = req.body;
        const adminId = req.admin.id;

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

        if (password) {
            const { iv, encryptedData } = encrypt(password);
            updateData.password = encryptedData;
            updateData.iv = iv; 
        }

        const updatedAdmin = await AdminUser.findByIdAndUpdate(adminId, updateData, { new: true });
        if (!updatedAdmin) {
            return res.status(404).json({ success: false, message: "Admin not found." });
        }

        return res.status(200).json({ success: true, message: "Profile updated successfully.", data: updatedAdmin });
    } catch (error) {
        console.error("Error updating admin:", error.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

import AdminOrder from '../../models/admin/admin.order.model.js';
import Product from '../../models/product.model.js';

export const getAdminAnalytics = async (req, res) => {
    try {
        // Total Earnings
        const totalEarningsResult = await AdminOrder.aggregate([
            { $match: { orderStatus: "Received" } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]);
        const totalEarnings = totalEarningsResult[0]?.total || 0;

        // Total Orders
        const totalOrders = await AdminOrder.countDocuments();

        // Monthly Earnings
        const monthlyEarningsResult = await AdminOrder.aggregate([
            { $match: { orderStatus: "Received" } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    earnings: { $sum: "$totalAmount" },
                },
            },
            { $sort: { "_id.month": 1 } },
        ]);

        const monthlyEarnings = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            earnings: 0,
        }));

        monthlyEarningsResult.forEach((entry) => {
            monthlyEarnings[entry._id.month - 1].earnings = entry.earnings;
        });

        // Best Sellers
        const bestSellersResult = await AdminOrder.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
        ]);

        const bestSellers = await Product.find({
            '_id': { $in: bestSellersResult.map(item => item._id) }
        }).select('name price image');

        const bestSellersWithQuantities = bestSellers.map(product => {
            const totalSold = bestSellersResult.find(item => item._id.toString() === product._id.toString()).totalSold;
            return { product, totalSold };
        });
        
        res.status(200).json({
            totalEarnings,
            totalOrders,
            monthlyEarnings,
            bestSellers: bestSellersWithQuantities,
        });
    } catch (error) {
        console.error("Error fetching analytics:", error.message);
        res.status(500).json({ error: "Failed to fetch analytics data" });
    }
};

export const getBestSellers = async (req, res) => {
    try {
        const bestSellersResult = await AdminOrder.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
        ]);

        const bestSellers = await Product.find({
            '_id': { $in: bestSellersResult.map(item => item._id) }
        }).select('name price image');

        const bestSellersWithQuantities = bestSellers.map(product => {
            const totalSold = bestSellersResult.find(item => item._id.toString() === product._id.toString()).totalSold;
            return { product, totalSold };
        });

        res.status(200).json({ bestSellers: bestSellersWithQuantities });
    } catch (error) {
        console.error("Error fetching best sellers:", error.message);
        res.status(500).json({ error: "Failed to fetch best sellers." });
    }
};

import AdminAnalytics from '../../models/admin/admin.analytics.model.js';
import xlsx from 'xlsx';

export const generateAnalyticsReport = async (req, res) => {
    try {
        // Fetch analytics data if it exists
        const existingAnalyticsData = await AdminAnalytics.findOne();

        let analyticsData;

        if (!existingAnalyticsData) {
            // Aggregate data from AdminOrder if no existing analytics
            const totalEarningsResult = await AdminOrder.aggregate([
                { $match: { orderStatus: "Received" } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } },
            ]);

            const totalEarnings = totalEarningsResult[0]?.total || 0;

            const totalOrders = await AdminOrder.countDocuments();

            // Monthly Earnings
            const monthlyEarningsResult = await AdminOrder.aggregate([
                { $match: { orderStatus: "Received" } },
                {
                    $group: {
                        _id: { month: { $month: "$createdAt" } },
                        earnings: { $sum: "$totalAmount" },
                    },
                },
                { $sort: { "_id.month": 1 } },
            ]);

            const monthlyEarnings = Array.from({ length: 12 }, (_, i) => ({
                month: i + 1,
                earnings: 0,
            }));

            monthlyEarningsResult.forEach((entry) => {
                monthlyEarnings[entry._id.month - 1].earnings = entry.earnings;
            });

            // Best Sellers
            const bestSellersResult = await AdminOrder.aggregate([
                { $unwind: "$items" },
                { $group: { _id: "$items.product", totalSold: { $sum: "$items.quantity" } } },
                { $sort: { totalSold: -1 } },
                { $limit: 10 },
            ]);

            const bestSellers = await Product.find({
                '_id': { $in: bestSellersResult.map(item => item._id) }
            }).select('name price image');

            const bestSellersWithQuantities = bestSellers.map(product => {
                const totalSold = bestSellersResult.find(item => item._id.toString() === product._id.toString()).totalSold;
                return { product, totalSold };
            });

            analyticsData = {
                totalEarnings,
                totalOrders,
                monthlyEarnings,
                bestSellers: bestSellersWithQuantities,
                generatedAt: new Date().toISOString(),
            };

            // Save the new analytics data to the AdminAnalytics collection
            await AdminAnalytics.create(analyticsData);

        } else {
            analyticsData = existingAnalyticsData;
        }

        // Now, generate the Excel report
        const report = {
            totalEarnings: analyticsData.totalEarnings,
            totalOrders: analyticsData.totalOrders,
            monthlyEarnings: analyticsData.monthlyEarnings, 
            bestSellers: analyticsData.bestSellers,     
            generatedAt: analyticsData.generatedAt,
        };

        // Convert report data to Excel format
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet([report]);

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Analytics Report');

        // Write to Excel file
        const filePath = 'C:/Users/Win 10/Desktop/analytics-report.xlsx'; 
        xlsx.writeFile(workbook, filePath);
        
        console.log('Analytics report exported successfully.');
        return res.status(200).json({ success: true, filePath }); 

    } catch (error) {
        console.error('Error generating analytics report:', error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};