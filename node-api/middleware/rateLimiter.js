/**
 * Production Rate Limiter
 * Tracks by authenticated user email (most reliable identifier)
 * Falls back to IP for unauthenticated requests
 */
const requestCounts = new Map();

/**
 * Rate limiter middleware
 * @param {number} maxRequests - Maximum requests allowed per user
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} customMessage - Optional user-facing custom message
 */
function rateLimiter(maxRequests = 50, windowMs = 60 * 60 * 1000, customMessage = null) {
    return (req, res, next) => {
        // Priority: authenticated user email > user ID > IP
        const identifier = req.user?.email || req.user?.id || req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
        const now = Date.now();
        const key = `${identifier}:${req.baseUrl || ''}${req.path}`;
        
        if (!requestCounts.has(key)) {
            requestCounts.set(key, []);
        }
        
        const requests = requestCounts.get(key);
        const recentRequests = requests.filter(timestamp => now - timestamp < windowMs);
        
        if (recentRequests.length >= maxRequests) {
            const oldestRequest = recentRequests[0];
            const retryAfterSeconds = Math.max(1, Math.ceil((oldestRequest + windowMs - now) / 1000));
            const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);
            
            const message = customMessage || 
                `Rate limit exceeded: maximum ${maxRequests} requests per ${Math.round(windowMs / 60000)} minutes. Please wait ${retryAfterMinutes} minute${retryAfterMinutes > 1 ? 's' : ''} before trying again.`;
            
            res.setHeader("Retry-After", retryAfterSeconds);
            return res.status(429).json({
                error: "Too Many Requests",
                message,
                retryAfter: retryAfterSeconds,
                retryAfterMinutes,
                identifier: req.user?.email ? "authenticated_user" : "ip_address"
            });
        }
        
        recentRequests.push(now);
        requestCounts.set(key, recentRequests);
        
        next();
    };
}

// Cleanup old entries every 15 minutes
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
}, 15 * 60 * 1000);

module.exports = rateLimiter;
