const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "FutrixAiSuperSecretKey_32chars!!!";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "FutrixAiRefreshSecretKey_32chars!!!";

/**
 * Generate access token (short-lived)
 */
function generateAccessToken(user) {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email, 
            role: "user" 
        },
        JWT_SECRET,
        { expiresIn: "15m" } // 15 minutes
    );
}

/**
 * Generate refresh token (long-lived)
 */
function generateRefreshToken(user) {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email 
        },
        JWT_REFRESH_SECRET,
        { expiresIn: "7d" } // 7 days
    );
}

/**
 * Verify access token
 */
function verifyAccessToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        throw new Error("Invalid or expired access token");
    }
}

/**
 * Verify refresh token
 */
function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (err) {
        throw new Error("Invalid or expired refresh token");
    }
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
