const express  = require("express");
const axios    = require("axios");
const { OAuth2Client } = require("google-auth-library");
const router   = express.Router();

const User     = require("../models/User");
const Analysis = require("../models/Analysis");
const auth     = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");
const { generateTokens, verifyRefreshToken } = require("../utils/authUtils");

const PYTHON_URL  = (process.env.PYTHON_URL  || "http://localhost:8000").replace(/\/$/, '');
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── POST /api/login ──────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/login", rateLimiter(30, 60 * 60 * 1000), async (req, res) => {
    const { email } = req.body;
    if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ error: "A valid email is required." });
    }
    try {
        let user = await User.findOne({ email });
        
        // Check if account is locked
        if (user && user.isLocked) {
            return res.status(423).json({ 
                error: "Account Locked", 
                message: "Too many failed attempts. Please try again later." 
            });
        }
        
        if (!user) {
            user = await User.create({ email });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);
        
        // Save refresh token to database
        user.refreshToken = refreshToken;
        user.lastLogin = new Date();
        await user.save();

        res.json({ 
            status: "logged_in", 
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error("[login]", err.message);
        res.status(500).json({ error: "Server error during login." });
    }
});

// ─── POST /api/auth/google ────────────────────────────────────────────────────
router.post("/auth/google", rateLimiter(30, 60 * 60 * 1000), async (req, res) => {
    const { credential } = req.body;
    if (!credential) {
        return res.status(400).json({ error: "Google credential is required." });
    }
    if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({
            error: "Google OAuth is not configured",
            message: "GOOGLE_CLIENT_ID is missing on the backend."
        });
    }
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email || !payload.sub) {
            return res.status(401).json({
                error: "Invalid Google token",
                message: "Google token payload is incomplete or invalid."
            });
        }
        const { email, sub, name, picture, email_verified } = payload;

        if (!email_verified) {
            return res.status(403).json({ 
                error: "Email not verified", 
                message: "Please verify your email with Google first." 
            });
        }

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                email,
                name: name || email.split('@')[0],
                googleId: sub,
                avatar: picture,
                lastLogin: new Date()
            });
        } else {
            if (!user.googleId) user.googleId = sub;
            user.name  = name  || user.name;
            user.avatar = picture || user.avatar;
            user.lastLogin = new Date();
            if (user.loginAttempts > 0) await user.resetLoginAttempts();
            await user.save();
        }

        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshToken = refreshToken;
        await user.save();

        res.json({ 
            status: "logged_in", 
            accessToken,
            refreshToken,
            user: { id: user._id, email: user.email, name: user.name, avatar: user.avatar }
        });
    } catch (err) {
        const msg = err?.message || "Unknown Google auth error";
        console.error("[google-auth]", msg);

        if (msg.includes("Token used too late")) {
            return res.status(401).json({ error: "Token expired", message: "Google token expired. Please try again." });
        }

        if (
            msg.includes("Wrong recipient") ||
            msg.includes("audience") ||
            msg.includes("Invalid token") ||
            msg.includes("malformed") ||
            msg.includes("Wrong number of segments")
        ) {
            return res.status(401).json({
                error: "Invalid Google token",
                message: "Google token validation failed. Ensure frontend and backend use the same Google client ID."
            });
        }

        if (msg.includes("Expiration time too far in future") || msg.includes("used too early")) {
            return res.status(401).json({
                error: "System clock out of sync",
                message: "Server time is out of sync with Google. Sync your OS date/time and try Google sign-in again."
            });
        }

        res.status(500).json({ error: "Google authentication failed", message: msg });
    }
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────
router.post("/auth/refresh", async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(401).json({ 
            error: "Refresh token required",
            message: "Please provide a refresh token"
        });
    }
    
    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);
        
        // Find user and verify refresh token matches
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ 
                error: "User not found",
                message: "Invalid refresh token"
            });
        }
        
        if (user.refreshToken !== refreshToken) {
            return res.status(403).json({ 
                error: "Invalid refresh token",
                message: "Token does not match stored token"
            });
        }
        
        // Generate new tokens
        const tokens = generateTokens(user);
        
        // Update refresh token in database
        user.refreshToken = tokens.refreshToken;
        await user.save();
        
        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (err) {
        console.error("[refresh-token]", err.message);
        res.status(403).json({ 
            error: "Invalid refresh token",
            message: err.message
        });
    }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
// No auth middleware — token may already be expired when user logs out
router.post("/auth/logout", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
        }
        res.json({ status: "logged_out" });
    } catch (err) {
        console.error("[logout]", err.message);
        res.status(500).json({ error: "Logout failed" });
    }
});

// ─── GET /api/auth/verify ─────────────────────────────────────────────────────
router.get("/auth/verify", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-refreshToken -loginAttempts -lockUntil');
        
        if (!user) {
            return res.status(404).json({ 
                valid: false,
                error: "User not found" 
            });
        }
        
        res.json({
            valid: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                lastLogin: user.lastLogin
            }
        });
    } catch (err) {
        console.error("[verify-token]", err.message);
        res.status(500).json({ 
            valid: false,
            error: "Token verification failed" 
        });
    }
});

// ─── Helper: Retry logic for AI service ────────────────────────────────────────
async function callAIServiceWithRetry(text, maxRetries = 3, initialDelay = 2000) {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[AI-Service] Attempt ${attempt}/${maxRetries} to call AI engine`);
            
            // Longer timeout for first call (cold start) vs retries
            const timeout = attempt === 1 ? 90_000 : 60_000;
            
            const aiRes = await axios.post(
                `${PYTHON_URL}/analyze`,
                { resume: text },
                { 
                    timeout,
                    headers: {
                        'X-Request-Attempt': String(attempt),
                        'User-Agent': 'Futrix-Node-API/1.0'
                    }
                }
            );
            
            console.log(`[AI-Service] ✅ Success on attempt ${attempt}`);
            return aiRes.data;
        } catch (err) {
            lastError = err;
            const errorType = err.code || err.response?.status || 'UNKNOWN';
            const duration = err.config?.timeout || 0;
            
            console.error(`[AI-Service] ❌ Attempt ${attempt} failed: ${errorType} (timeout: ${duration}ms)`);
            
            // Don't retry on client errors (4xx)
            if (err.response?.status && err.response.status < 500) {
                console.error(`[AI-Service] Client error ${err.response.status} - not retrying`);
                throw err;
            }
            
            // Calculate backoff delay
            if (attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt - 1); // Exponential backoff
                console.log(`[AI-Service] Waiting ${delay}ms before retry...`);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    
    // All retries exhausted
    throw lastError;
}

// ─── POST /api/upload-resume ──────────────────────────────────────────────────
router.post("/upload-resume", auth, rateLimiter(50, 60 * 60 * 1000), async (req, res) => {
    const { text, email } = req.body;
    if (!text || text.trim().length < 50) {
        return res.status(400).json({ error: "Resume text is too short. Please provide at least 50 characters." });
    }
    try {
        // Validate Python URL is configured
        if (!PYTHON_URL || PYTHON_URL === 'http://localhost:8000') {
            console.error("[upload-resume] ❌ PYTHON_URL not configured for production");
            return res.status(503).json({ error: "AI service is not properly configured. Please try again later." });
        }

        // Try to wake up Python AI with timeout
        console.log("[upload-resume] 🔥 Warming up AI service...");
        try { 
            await axios.get(`${PYTHON_URL}/`, { 
                timeout: 5_000,
                headers: { 'User-Agent': 'Futrix-Warmer/1.0' }
            }); 
            console.log("[upload-resume] ✅ AI service is warm");
        } catch (wakeErr) {
            console.warn("[upload-resume] ⚠️ AI service may be cold starting (wake-up attempt failed)");
            // Continue - service might still respond to main request
        }

        // Call Python AI engine with intelligent retry
        console.log("[upload-resume] 📊 Calling AI analysis service...");
        let aiData;
        try {
            aiData = await callAIServiceWithRetry(text, 3, 1000);
        } catch (aiErr) {
            console.error("[upload-resume] ❌ AI service error after retries:", aiErr.message);
            
            // Provide specific error messages based on error type
            if (aiErr.code === "ECONNREFUSED") {
                return res.status(503).json({ 
                    error: "AI engine is offline",
                    message: "The analysis service is temporarily down. Please try again in 30 seconds.",
                    retryAfter: 30
                });
            }
            if (aiErr.code === "ECONNABORTED" || aiErr.message?.includes("timeout")) {
                return res.status(503).json({ 
                    error: "Request timeout",
                    message: "The AI engine is processing requests slowly. This is normal on the free tier. Please wait 30-60 seconds and try again.",
                    retryAfter: 60
                });
            }
            if (aiErr.response?.status === 503) {
                return res.status(503).json({ 
                    error: "Service unavailable",
                    message: "The AI engine is temporarily overloaded. Please wait a moment and try again.",
                    retryAfter: 30
                });
            }
            if (aiErr.response?.status === 504 || aiErr.response?.status === 502) {
                return res.status(503).json({ 
                    error: "Gateway timeout",
                    message: "The request took too long to process. This is normal on the free tier when service is cold-starting. Please wait 60 seconds and try again.",
                    retryAfter: 60
                });
            }
            if (aiErr.response?.data?.detail) {
                return res.status(400).json({ error: aiErr.response.data.detail });
            }
            
            // Generic service error
            console.error("[upload-resume] Unexpected AI error:", {
                status: aiErr.response?.status,
                message: aiErr.message,
                code: aiErr.code,
            });
            
            return res.status(503).json({ 
                error: "Analysis temporarily unavailable",
                message: "Please wait 30 seconds and try again. On the free tier, the AI engine may take time to start.",
                retryAfter: 30
            });
        }

        // Validate AI response
        if (!aiData || typeof aiData !== 'object') {
            console.error("[upload-resume] ❌ Invalid AI response format");
            return res.status(500).json({ 
                error: "Invalid response from AI service",
                message: "The AI service returned an unexpected response format. Please try again."
            });
        }

        // Persist to MongoDB with error handling
        let saved;
        try {
            saved = await Analysis.create({
                email:           email || req.user?.email,
                resumeText:      text,
                skills:          aiData.skills          || [],
                gap_skills:      aiData.gap_skills       || [],
                readiness_score: aiData.readiness_score  || 0,
                roadmap:         aiData.roadmap          || [],
                score_breakdown: aiData.score_breakdown  || null,
                career_paths:    aiData.career_paths     || [],
            });
            console.log("[upload-resume] ✅ Analysis saved successfully");
        } catch (dbErr) {
            console.error("[upload-resume] ❌ Database error:", dbErr.message);
            
            if (dbErr.name === "ValidationError") {
                return res.status(400).json({ error: "Invalid data format", detail: dbErr.message });
            }
            if (dbErr.name === "MongoNetworkError" || dbErr.message?.includes("ECONNREFUSED")) {
                return res.status(503).json({ error: "Database is temporarily unavailable. Please try again." });
            }
            
            return res.status(500).json({ error: "Failed to save analysis. Please try again.", detail: dbErr.message });
        }

        res.json({ ...aiData, _id: saved._id });
    } catch (err) {
        console.error("[upload-resume] Unexpected error:", err.message, err.stack);
        res.status(500).json({ error: "Analysis failed. Please try again.", detail: err.message });
    }
});

// ─── GET /api/upload-resume (method not allowed) ───────────────────────────────
router.get("/upload-resume", (req, res) => {
    res.status(405).json({ 
        error: "Method Not Allowed", 
        message: "POST /api/upload-resume is the correct endpoint. Send resume text and email.",
        example: { text: "Your resume text...", email: "user@example.com" }
    });
});

// ─── GET /api/history ─────────────────────────────────────────────────────────
// Returns the last 20 analyses for a user, sorted newest first.
router.get("/history", auth, async (req, res) => {
    const email = req.query.email || req.user?.email;
    if (!email) return res.status(400).json({ error: "Email required." });
    try {
        const analyses = await Analysis
            .find({ email })
            .sort({ createdAt: -1 })
            .limit(20)
            .select("-resumeText"); // don't send full text back
        res.json(analyses);
    } catch (err) {
        console.error("[history]", err.message);
        res.status(500).json({ error: "Failed to fetch history." });
    }
});

// ─── GET /api/compare ─────────────────────────────────────────────────────────
// Compare two analyses by ID and return delta.
router.get("/compare", auth, async (req, res) => {
    const { id1, id2 } = req.query;
    if (!id1 || !id2) return res.status(400).json({ error: "id1 and id2 are required." });
    try {
        const [a, b] = await Promise.all([
            Analysis.findById(id1).select("-resumeText"),
            Analysis.findById(id2).select("-resumeText"),
        ]);
        if (!a || !b) return res.status(404).json({ error: "One or both analyses not found." });

        const newSkills     = b.skills.filter(s => !a.skills.includes(s));
        const resolvedGaps  = a.gap_skills.filter(g => !b.gap_skills.includes(g));
        const remainingGaps = b.gap_skills;
        const scoreDelta    = b.readiness_score - a.readiness_score;

        res.json({
            analysis_a: a,
            analysis_b: b,
            delta: {
                score:          scoreDelta,
                new_skills:     newSkills,
                resolved_gaps:  resolvedGaps,
                remaining_gaps: remainingGaps,
            },
        });
    } catch (err) {
        console.error("[compare]", err.message);
        res.status(500).json({ error: "Comparison failed." });
    }
});

// ─── POST /api/jobs/match ─────────────────────────────────────────────────────
// Returns matching job titles + salary data based on skills.
const JOB_DB = [
    { title: "Frontend Engineer",     requiredSkills: ["React", "TypeScript", "JavaScript", "CSS"],          salary: "$85k–$130k", demand: "High"      },
    { title: "Full Stack Developer",  requiredSkills: ["React", "Node.js", "MongoDB", "REST API", "Docker"], salary: "$90k–$145k", demand: "Very High"  },
    { title: "Backend Engineer",      requiredSkills: ["Node.js", "Python", "MongoDB", "Docker", "AWS"],     salary: "$95k–$150k", demand: "High"       },
    { title: "DevOps Engineer",       requiredSkills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux"],     salary: "$100k–$160k", demand: "Very High" },
    { title: "Data Engineer",         requiredSkills: ["Python", "SQL", "Spark", "AWS", "Airflow"],          salary: "$105k–$155k", demand: "High"      },
    { title: "ML Engineer",           requiredSkills: ["Python", "Machine Learning", "TensorFlow", "Docker"], salary: "$120k–$180k", demand: "Very High" },
    { title: "Cloud Architect",       requiredSkills: ["AWS", "Kubernetes", "Terraform", "Docker"],           salary: "$130k–$200k", demand: "High"     },
];

router.post("/jobs/match", auth, async (req, res) => {
    const { skills = [] } = req.body;
    if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({ error: "skills array is required." });
    }
    const skillsLower = skills.map(s => s.toLowerCase());
    const matches = JOB_DB.map(job => {
        const matched  = job.requiredSkills.filter(r => skillsLower.includes(r.toLowerCase()));
        const missing  = job.requiredSkills.filter(r => !skillsLower.includes(r.toLowerCase()));
        const percent  = Math.round((matched.length / job.requiredSkills.length) * 100);
        return { ...job, matchPercent: percent, matchedSkills: matched, missingSkills: missing };
    }).sort((a, b) => b.matchPercent - a.matchPercent);

    res.json(matches);
});

module.exports = router;
