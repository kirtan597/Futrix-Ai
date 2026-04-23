/**
 * Simple in-memory rate limiter
 * For production, use Redis-based rate limiting
 */
const requestCounts = new Map();

/**
 * Rate limiter middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 */
function rateLimiter(maxRequests = 5, windowMs = 15 * 60 * 1000) {
    return (req, res, next) => {
        const identifier = req.ip || req.connection.remoteAddress;
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
                message: `Maximum ${maxRequests} requests per ${windowMs / 60000} minutes. Please try again later.`,
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
