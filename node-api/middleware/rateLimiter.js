/**
 * Production Rate Limiter
 * Tracks by authenticated user email (most reliable identifier)
 * Falls back to IP for unauthenticated requests
 * 
 * For authenticated users: Tracks individually by email
 * For unauthenticated: Tracks by IP with generous limits
 */
const requestCounts = new Map();

/**
 * Rate limiter middleware
 * @param {number} maxRequests - Maximum requests allowed per user
 * @param {number} windowMs - Time window in milliseconds (default 1 hour)
 */
function rateLimiter(maxRequests = 50, windowMs = 60 * 60 * 1000) {
    return (req, res, next) => {
        // Priority: authenticated user email > user ID > IP
        const identifier = req.user?.email || req.user?.id || req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
        const now = Date.now();
        const key = `${identifier}:${req.path}`;
        
        // Initialize request tracking for this identifier+path
        if (!requestCounts.has(key)) {
            requestCounts.set(key, []);
        }
        
        const requests = requestCounts.get(key);
        
        // Remove requests outside the window
        const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
        
        // Check if limit exceeded
        if (recentRequests.length >= maxRequests) {
            const oldestRequest = recentRequests[0];
            const retryAfterSeconds = Math.ceil((oldestRequest + windowMs - now) / 1000);
            
            return res.status(429).json({
                error: "Too Many Requests",
                message: `Rate limit: ${maxRequests} requests per ${Math.round(windowMs / 60000)} minutes`,
                retryAfter: retryAfterSeconds,
                identifier: req.user?.email ? "authenticated_user" : "ip_address"
            });
        }
        
        // Add current request timestamp
        recentRequests.push(now);
        requestCounts.set(key, recentRequests);
        
        next();
    };
}

// Cleanup old entries every 30 minutes
setInterval(() => {
    const now = Date.now();
    const twoHours = 2 * 60 * 60 * 1000;
    
    for (const [key, requests] of requestCounts.entries()) {
        const recentRequests = requests.filter(timestamp => now - timestamp < twoHours);
        
        if (recentRequests.length === 0) {
            requestCounts.delete(key);
        } else {
            requestCounts.set(key, recentRequests);
        }
    }
}, 30 * 60 * 1000);

module.exports = rateLimiter;
