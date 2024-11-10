
const verifyUserToken = async (req, res, next) => {
    try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ success: false, message: "No token provided." });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ success: false, message: "Token token found." });

    const isBlacklisted = await Blacklist.findOne({ token });
    if (isBlacklisted) return res.status(403).json({ success: false, message: "Token has been logged out." });

    req.token = token;
    next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
