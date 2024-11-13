import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.OROASTKO_SECRET || "oroastko_secret_key";

export const verifyAdminRole = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, JWT_SECRET);

        if (decodedToken && decodedToken.role === 'admin') { 
            req.admin = { adminId: decodedToken.id };
            next(); 
        } else {
            return res.status(403).json({ success: false, message: "Access denied. Admins only." });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or missing token." });
    }
};
