const express  = require("express");
const axios    = require("axios");
const router   = express.Router();

const userRepo         = require("../db/userRepo");
const analysisRepo     = require("../db/analysisRepo");
const refreshTokenRepo = require("../db/refreshTokenRepo");

const auth         = require("../middleware/auth");
const rateLimiter  = require("../middleware/rateLimiter");
const { generateTokens, verifyRefreshToken, verifyAccessToken } = require("../utils/authUtils");
const { verifyFirebaseToken } = require("../utils/firebaseAdmin");

const PYTHON_URL           = (process.env.PYTHON_URL || "http://localhost:8000").replace(/\/$/, '');
const INTERNAL_API_SECRET  = process.env.INTERNAL_API_SECRET;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── GET /api/login (preflight guard) ────────────────────────────────────────
router.get("/login", (req, res) => {
    res.status(405).json({ 
        error: "Method Not Allowed", 
        message: "Use POST /api/login with email in body" 
    });
});

// ─── POST /api/login (10 logins / 15 min) ─────────────────────────────────────
router.post("/login", rateLimiter(10, 15 * 60 * 1000, "Too many login attempts. Please wait a few minutes before trying again."), async (req, res) => {
    const { email } = req.body;
    
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
        return res.status(400).json({ error: "A valid email address is required." });
    }

    const sanitizedEmail = email.trim().toLowerCase();

    try {
        let user = await userRepo.findByEmail(sanitizedEmail);
        
        // Check if account is locked
        if (user && user.isLocked) {
            return res.status(423).json({ 
                error: "Account Locked", 
                message: "Too many failed attempts. Please try again later." 
            });
        }
        
        if (!user) {
            user = await userRepo.createUser({ email: sanitizedEmail });
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);
        
        // Save refresh token & login timestamp to database
        await refreshTokenRepo.storeRefreshToken(user.id, refreshToken);
        await userRepo.resetLoginAttempts(user.id);

        res.json({ 
            status: "logged_in", 
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                _id: user.id,
                email: user.email,
                name: user.name || user.email.split('@')[0],
                avatar: user.avatar
            }
        });
    } catch (err) {
        console.error("[login] ERROR:", err.message);
        res.status(500).json({ 
            error: "Server error during login.", 
            detail: process.env.NODE_ENV === 'production' ? "An internal server error occurred." : err.message 
        });
    }
});

// ─── GET /api/auth/firebase (preflight guard) ─────────────────────────────────
router.get("/auth/firebase", (req, res) => {
    res.status(405).json({
        error: "Method Not Allowed",
        message: "Use POST /api/auth/firebase with idToken in body"
    });
});

// ─── POST /api/auth/firebase (Firebase ID Token Verification) ──────────────────
router.post("/auth/firebase", rateLimiter(20, 15 * 60 * 1000, "Too many authentication attempts. Please wait a few minutes."), async (req, res) => {
    const { idToken } = req.body;
    
    if (!idToken) {
        return res.status(400).json({ error: "Firebase ID token is required." });
    }
    
    try {
        const decoded = await verifyFirebaseToken(idToken);
        
        if (!decoded || !decoded.email) {
            return res.status(401).json({
                error: "Invalid Firebase Token",
                message: "Firebase token payload is incomplete or missing email."
            });
        }
        
        const { email, uid, name, picture } = decoded;
        const sanitizedEmail = email.trim().toLowerCase();

        let user = await userRepo.findByEmail(sanitizedEmail);
        if (!user) {
            user = await userRepo.createUser({
                email: sanitizedEmail,
                name: name || sanitizedEmail.split('@')[0],
                firebaseUid: uid,
                avatar: picture,
            });
        } else {
            user = await userRepo.updateUser(user.id, {
                firebaseUid: uid || user.firebaseUid,
                name: name || user.name,
                avatar: picture || user.avatar,
                lastLogin: new Date(),
                loginAttempts: 0,
                lockUntil: null,
            });
        }

        const { accessToken, refreshToken } = generateTokens(user);
        await refreshTokenRepo.storeRefreshToken(user.id, refreshToken);

        res.json({ 
            status: "logged_in", 
            accessToken,
            refreshToken,
            user: { 
                id: user.id,
                _id: user.id,
                email: user.email, 
                name: user.name, 
                avatar: user.avatar 
            }
        });
    } catch (err) {
        console.error("[firebase-auth] ❌ Error:", err.message);
        res.status(401).json({ 
            error: "Firebase authentication failed", 
            message: process.env.NODE_ENV === 'production' ? "Authentication failed. Please sign in again." : err.message 
        });
    }
});

// ─── GET /api/auth/refresh (preflight guard) ──────────────────────────────────
router.get("/auth/refresh", (req, res) => {
    res.status(405).json({
        error: "Method Not Allowed",
        message: "Use POST /api/auth/refresh with refreshToken in body"
    });
});

// ─── POST /api/auth/refresh (Token Rotation) ──────────────────────────────────
router.post("/auth/refresh", async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
        return res.status(401).json({ 
            error: "Refresh token required",
            message: "Please provide a refresh token"
        });
    }
    
    try {
        // Verify refresh token signature and expiry
        const decoded = verifyRefreshToken(refreshToken);
        
        // Find user by ID
        const user = await userRepo.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ 
                error: "User not found",
                message: "Invalid refresh token"
            });
        }
        
        // Check if token exists in Postgres and is not revoked
        const validToken = await refreshTokenRepo.findValidToken(refreshToken);
        if (!validToken) {
            return res.status(403).json({ 
                error: "Invalid refresh token",
                message: "Token has been rotated or invalidated. Please log in again."
            });
        }
        
        // Generate new token pair (Token Rotation)
        const tokens = generateTokens(user);
        
        // Invalidate old refresh token and store new one
        await refreshTokenRepo.revokeToken(refreshToken);
        await refreshTokenRepo.storeRefreshToken(user.id, tokens.refreshToken);
        
        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (err) {
        console.error("[refresh-token]", err.message);
        res.status(403).json({ 
            error: "Invalid refresh token",
            message: err.name === "TokenExpiredError" ? "Refresh token expired. Please log in again." : "Invalid refresh token"
        });
    }
});

// ─── GET /api/auth/logout (preflight guard) ───────────────────────────────────
router.get("/auth/logout", (req, res) => {
    res.status(405).json({
        error: "Method Not Allowed",
        message: "Use POST /api/auth/logout with refreshToken in body"
    });
});

// ─── POST /api/auth/logout (Server-side Invalidation) ──────────────────────────
router.post("/auth/logout", async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const authHeader = req.header("Authorization");
        
        if (refreshToken) {
            await refreshTokenRepo.revokeToken(refreshToken);
        }
        
        // If Bearer token was provided, also revoke user tokens
        if (authHeader) {
            const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
            try {
                const verified = verifyAccessToken(token);
                if (verified?.id) {
                    await refreshTokenRepo.revokeAllUserTokens(verified.id);
                }
            } catch {
                // Token may already be expired upon logout — that's fine
            }
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
        const user = await userRepo.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ 
                valid: false, 
                error: "User not found" 
            });
        }
        
        res.json({
            valid: true,
            user: {
                id: user.id,
                _id: user.id,
                email: user.email,
                name: user.name || user.email.split('@')[0],
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

// ─── GET /api/profile ─────────────────────────────────────────────────────────
router.get("/profile", auth, async (req, res) => {
    try {
        const user = await userRepo.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User profile not found" });
        }
        res.json({
            id: user.id,
            _id: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            avatar: user.avatar,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        });
    } catch (err) {
        console.error("[profile-get]", err.message);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// ─── PUT /api/profile ─────────────────────────────────────────────────────────
router.put("/profile", auth, async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const updates = {};
        if (typeof name === 'string') updates.name = name.trim().slice(0, 100);
        if (typeof avatar === 'string') updates.avatar = avatar.trim().slice(0, 500);

        const user = await userRepo.updateUser(req.user.id, updates);

        res.json({
            id: user.id,
            _id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar
        });
    } catch (err) {
        console.error("[profile-update]", err.message);
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// ─── Helper: Retry logic for AI service ────────────────────────────────────────
async function callAIServiceWithRetry(text, maxRetries = 3, initialDelay = 800) {
    let lastError = null;
    const PYTHON_URL_ENDPOINT = `${PYTHON_URL}/analyze`;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const timeout = attempt === 1 ? 60_000 : 30_000;
            const headers = {
                'X-Request-Attempt': String(attempt),
                'User-Agent': 'Futrix-Node-API/2.1',
                'Content-Type': 'application/json'
            };
            
            // Hop-by-hop internal authentication
            if (INTERNAL_API_SECRET) {
                headers['X-Internal-Secret'] = INTERNAL_API_SECRET;
            }
            
            const aiRes = await axios.post(
                PYTHON_URL_ENDPOINT,
                { resume: text },
                { timeout, headers }
            );
            
            return aiRes.data;
        } catch (err) {
            lastError = err;
            const errorType = err.code || err.response?.status || 'UNKNOWN';
            
            console.error(`[AI-Service] ❌ Attempt ${attempt}/${maxRetries} failed:`, {
                type: errorType,
                status: err.response?.status,
                message: err.message,
                endpoint: PYTHON_URL_ENDPOINT
            });
            
            // Don't retry on 4xx client errors
            if (err.response?.status && err.response.status < 500 && err.response.status !== 503 && err.response.status !== 504) {
                throw err;
            }
            
            if (attempt < maxRetries) {
                const delay = initialDelay * Math.pow(2, attempt - 1);
                await new Promise(r => setTimeout(r, delay));
            }
        }
    }
    
    throw lastError;
}

// ─── GET /api/upload-resume (preflight guard) ─────────────────────────────────
router.get("/upload-resume", (req, res) => {
    res.status(405).json({
        error: "Method Not Allowed",
        message: "Use POST /api/upload-resume with text in body"
    });
});

// ─── POST /api/upload-resume (Generous limit for smooth usage) ───────────────
router.post("/upload-resume", auth, rateLimiter(100, 15 * 60 * 1000, "Too many upload requests. Please wait a moment before trying again."), async (req, res) => {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string' || text.trim().length < 50) {
        return res.status(400).json({ 
            error: "Resume text is too short. Please provide at least 50 characters." 
        });
    }

    if (text.length > 50000) {
        return res.status(400).json({
            error: "Resume text exceeds maximum length of 50,000 characters."
        });
    }

    const sanitizedText = text.trim();
    console.log(`[upload-resume] 📤 POST request from user: ${req.user.email}, text length: ${sanitizedText.length} chars`);

    try {
        if (!PYTHON_URL) {
            return res.status(503).json({ error: "AI service is not properly configured." });
        }

        let aiData;
        try {
            aiData = await callAIServiceWithRetry(sanitizedText, 3, 1000);
        } catch (aiErr) {
            console.error("[upload-resume] ❌ AI service error:", aiErr.message);
            
            if (aiErr.code === "ECONNREFUSED") {
                return res.status(503).json({ 
                    error: "AI engine offline",
                    message: "Cannot connect to analysis service. Please try again in a moment.",
                    retryAfter: 10
                });
            }
            if (aiErr.code === "ECONNABORTED" || aiErr.message?.includes("timeout")) {
                return res.status(503).json({ 
                    error: "Request timeout",
                    message: "The analysis is taking longer than expected. Please try again.",
                    retryAfter: 5
                });
            }
            if (aiErr.response?.status === 400) {
                return res.status(400).json({ 
                    error: aiErr.response?.data?.detail || "Invalid resume format",
                    message: "The resume text could not be analyzed."
                });
            }
            
            return res.status(503).json({ 
                error: "Analysis service unavailable",
                message: "The AI engine is temporarily unavailable. Please try again shortly.",
                retryAfter: 10
            });
        }

        if (!aiData || typeof aiData !== 'object') {
            return res.status(500).json({ 
                error: "Invalid response from AI service",
                message: "Unexpected response format."
            });
        }

        // Persist to Supabase associated strictly with authenticated user
        let saved;
        try {
            saved = await analysisRepo.createAnalysis({
                user_id:               req.user.id,
                email:                 req.user.email,
                resumeText:            sanitizedText,
                skills:                aiData.skills                || [],
                gap_skills:            aiData.gap_skills             || [],
                readiness_score:       aiData.readiness_score        || 0,
                roadmap:               aiData.roadmap                || [],
                score_breakdown:       aiData.score_breakdown        || null,
                career_paths:          aiData.career_paths           || [],
                skill_weights:         aiData.skill_weights          || [],
                category_distribution: aiData.category_distribution || [],
                readiness_trajectory:  aiData.readiness_trajectory   || null,
            });
        } catch (dbErr) {
            console.error("[upload-resume] ❌ Database error:", dbErr.message);
            return res.status(500).json({ error: "Failed to save analysis results." });
        }

        res.json({ ...aiData, _id: saved.id, id: saved.id });
    } catch (err) {
        console.error("[upload-resume] Unexpected error:", err.message);
        res.status(500).json({ error: "Analysis failed. Please try again." });
    }
});

// ─── GET /api/history (Scoped to Authenticated User) ──────────────────────────
router.get("/history", auth, async (req, res) => {
    const email = req.user.email;
    
    try {
        const analyses = await analysisRepo.findHistoryByEmail(email, 20);
        res.json(analyses);
    } catch (err) {
        console.error("[history]", err.message);
        res.status(500).json({ error: "Failed to fetch history." });
    }
});

// ─── GET /api/compare (IDOR Protected) ────────────────────────────────────────
router.get("/compare", auth, async (req, res) => {
    const { id1, id2 } = req.query;
    if (!id1 || !id2) return res.status(400).json({ error: "id1 and id2 parameters are required." });
    
    try {
        const [a, b] = await Promise.all([
            analysisRepo.findById(id1),
            analysisRepo.findById(id2),
        ]);
        
        if (!a || !b) {
            return res.status(404).json({ error: "One or both analyses not found." });
        }

        // IDOR Check: Ensure both analyses belong to the requesting user
        if (a.email !== req.user.email || b.email !== req.user.email) {
            return res.status(403).json({ 
                error: "Access Denied", 
                message: "You can only compare your own analyses." 
            });
        }

        const newSkills     = (b.skills || []).filter(s => !(a.skills || []).includes(s));
        const resolvedGaps  = (a.gap_skills || []).filter(g => !(b.gap_skills || []).includes(g));
        const remainingGaps = b.gap_skills || [];
        const scoreDelta    = (b.readiness_score || 0) - (a.readiness_score || 0);

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
const JOB_DB = [
    { title: "Frontend Engineer",     requiredSkills: ["React", "TypeScript", "JavaScript", "CSS"],          salary: "$85k–$130k", demand: "High"      },
    { title: "Full Stack Developer",  requiredSkills: ["React", "Node.js", "MongoDB", "REST API", "Docker"], salary: "$90k–$145k", demand: "Very High"  },
    { title: "Backend Engineer",      requiredSkills: ["Node.js", "Python", "MongoDB", "Docker", "AWS"],     salary: "$95k–$150k", demand: "High"       },
    { title: "DevOps Engineer",       requiredSkills: ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux"],     salary: "$100k–$160k", demand: "Very High" },
    { title: "Data Engineer",         requiredSkills: ["Python", "SQL", "Spark", "AWS", "Airflow"],          salary: "$105k–$155k", demand: "High"      },
    { title: "ML Engineer",           requiredSkills: ["Python", "Machine Learning", "TensorFlow", "Docker"], salary: "$120k–$180k", demand: "Very High" },
    { title: "Cloud Architect",       requiredSkills: ["AWS", "Kubernetes", "Terraform", "Docker"],           salary: "$130k–$200k", demand: "High"     },
];

router.get("/jobs/match", (req, res) => {
    res.status(405).json({
        error: "Method Not Allowed",
        message: "Use POST /api/jobs/match with skills array in body"
    });
});

router.post("/jobs/match", auth, async (req, res) => {
    const { skills = [] } = req.body;
    if (!Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({ error: "skills array is required." });
    }
    const skillsLower = skills.map(s => String(s).toLowerCase());
    const matches = JOB_DB.map(job => {
        const matched  = job.requiredSkills.filter(r => skillsLower.includes(r.toLowerCase()));
        const missing  = job.requiredSkills.filter(r => !skillsLower.includes(r.toLowerCase()));
        const percent  = Math.round((matched.length / job.requiredSkills.length) * 100);
        return { ...job, matchPercent: percent, matchedSkills: matched, missingSkills: missing };
    }).sort((a, b) => b.matchPercent - a.matchPercent);

    res.json(matches);
});

// ─── POST /api/ats-check (ATS Heuristic Verification) ─────────────────────────
router.post("/ats-check", auth, async (req, res) => {
    const { resume, target_role } = req.body;
    if (!resume || typeof resume !== 'string' || resume.trim().length < 50) {
        return res.status(400).json({ error: "Resume text is too short. Please provide at least 50 characters." });
    }

    try {
        const headers = {
            'User-Agent': 'Futrix-Node-API/2.1',
            'Content-Type': 'application/json',
        };
        if (INTERNAL_API_SECRET) {
            headers['X-Internal-Secret'] = INTERNAL_API_SECRET;
        }

        const aiRes = await axios.post(
            `${PYTHON_URL}/ats-check`,
            { resume: resume.trim(), target_role },
            { timeout: 30000, headers }
        );

        res.json(aiRes.data);
    } catch (err) {
        console.error("[ats-check] ❌ Error:", err.message);
        res.status(503).json({
            error: "ATS Service Unavailable",
            message: "Could not complete ATS check at this time. Please try again shortly."
        });
    }
});

module.exports = router;
