const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "FutrixAiSuperSecretKey_32chars!!!";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "FutrixAiRefreshSecretKey_32chars!!!";

if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET)) {
    console.warn("⚠️  [Security Warning] JWT_SECRET or JWT_REFRESH_SECRET is not set in environment. Using default fallback is insecure for production.");
}

/**
 * Generate access token (short-lived: 15 minutes)
 */
function generateAccessToken(user) {
    return jwt.sign(
        { 
            id: user._id ? user._id.toString() : user.id, 
            email: user.email, 
            role: "user" 
        },
        JWT_SECRET,
        { expiresIn: "15m" }
    );
}

/**
 * Generate refresh token (long-lived: 7 days)
 */
function generateRefreshToken(user) {
    return jwt.sign(
        { 
            id: user._id ? user._id.toString() : user.id, 
            email: user.email 
        },
        JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
    return jwt.verify(token, JWT_REFRESH_SECRET);
}

/**
 * Generate both tokens
 */
function generateTokens(user) {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user)
    };
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateTokens
};
