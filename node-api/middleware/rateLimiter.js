/**
 * Simple in-memory rate limiter
 * Tracks by user email (authenticated) or IP (unauthenticated)
 */
const requestCounts = new Map();

/**
 * Rate limiter middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 */
function rateLimiter(maxRequests = 20, windowMs = 60 * 60 * 1000) {
    return (req, res, next) => {
        // Use user email if authenticated, otherwise use IP
        const identifier = req.user?.email || req.user?.id || req.ip || req.connection?.remoteAddress || 'unknown';
        const now = Date.now();
        
        if (!requestCounts.has(identifier)) {
            requestCounts.set(identifier, []);
        }
        
        const requests = requestCounts.get(identifier);
        
        // Remove old requests outside the time window
        const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
        
        if (recentRequests.length >= maxRequests) {
            return res.status(429).json({
                error: "Too Many Requests",
                message: `Maximum ${maxRequests} requests per ${Math.round(windowMs / 60000)} minutes. Please try again later.`,
                retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
            });
        }
        
        recentRequests.push(now);
        requestCounts.set(identifier, recentRequests);
        
        next();
    };
}

// Clean up old entries every hour
setInterval(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [identifier, requests] of requestCounts.entries()) {
        const recentRequests = requests.filter(timestamp => now - timestamp < oneHour);
        if (recentRequests.length === 0) {
            requestCounts.delete(identifier);
        } else {
            requestCounts.set(identifier, recentRequests);
        }
    }
}, 60 * 60 * 1000);

module.exports = rateLimiter;
