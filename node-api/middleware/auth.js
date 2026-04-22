const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "FutrixAiSuperSecretKey_32chars!!!"; // Must match JwtUtil.java exactly

module.exports = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid Token" });
    }
};
