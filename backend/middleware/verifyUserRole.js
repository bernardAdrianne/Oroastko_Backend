import jwt from 'jsonwebtoken';

export const verifyUserRole = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (decodedToken && decodedToken.role === 'user') { 
            next(); 
        } else {
            return res.status(403).json({ success: false, message: "Access denied. Customers only." });
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or missing token." });
    }
};
