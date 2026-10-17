const jwt = require("jsonwebtoken");
const { verifyAccessToken } = require("../utils/authUtils");

/**
 * Authentication middleware
 * Verifies JWT access token from Authorization header
 */
module.exports = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ 
            error: "Access Denied", 
            message: "No token provided" 
        });
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith("Bearer ") 
        ? authHeader.slice(7) 
        : authHeader;

    if (!token) {
        return res.status(401).json({ 
            error: "Access Denied", 
            message: "Invalid token format" 
        });
    }

    try {
        const verified = verifyAccessToken(token);
        req.user = verified;
        next();
    } catch (err) {
        // Development bypass for demo / local sessions
        if (process.env.NODE_ENV !== "production") {
            try {
                const decoded = jwt.decode(token);
                if (decoded && (decoded.email || decoded.id)) {
                    req.user = {
                        id: decoded.id || "demo-user-dev",
                        _id: decoded.id || "demo-user-dev",
                        email: decoded.email || "demo@futrix.ai",
                        role: "user"
                    };
                    return next();
                }
            } catch (_) {}
        }

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ 
                error: "Token Expired", 
                message: "Please refresh your token",
                code: "TOKEN_EXPIRED"
            });
        }
        return res.status(403).json({ 
            error: "Invalid Token", 
            message: err.message 
        });
    }
};
