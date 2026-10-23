const express  = require("express");
const axios    = require("axios");
const router   = express.Router();

const userRepo         = require("../db/userRepo");
const analysisRepo     = require("../db/analysisRepo");
const refreshTokenRepo = require("../db/refreshTokenRepo");

const auth         = require("../middleware/auth");
const rateLimiter  = require("../middleware/rateLimiter");
const { generateTokens, verifyRefreshToken, verifyAccessToken } = require("../utils/authUtils");
const { createClient } = require("@supabase/supabase-js");
const localAiEngine   = require("../utils/localAiEngine");

function getValidSupabaseKey() {
    const candidates = [
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        process.env.SUPABASE_ANON_KEY,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ];
    for (const key of candidates) {
        if (key && !key.includes('placeholder') && !key.includes('your_supabase') && key.length > 20) {
            return key;
        }
    }
    return null;
}

// Supabase auth client — used to verify user JWTs (supports SERVICE_ROLE_KEY, ANON_KEY, or PUBLISHABLE_KEY)
const SUPABASE_AUTH_KEY = getValidSupabaseKey();
const SUPABASE_AUTH_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAdmin = (SUPABASE_AUTH_URL && SUPABASE_AUTH_KEY)
    ? createClient(
        SUPABASE_AUTH_URL,
        SUPABASE_AUTH_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )
    : null;

const PYTHON_URL           = (process.env.PYTHON_URL || "http://localhost:8000").replace(/\/$/, '');
const INTERNAL_API_SECRET  = process.env.INTERNAL_API_SECRET;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── GET /api/login (preflight guard & browser redirect) ────────────────────────
router.get("/login", (req, res) => {
    if (req.accepts('html')) {
        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, '');
        return res.redirect(`${frontendUrl}/login`);
    }
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

// ─── GET /api/auth/supabase (preflight guard & browser redirect) ───────────────
router.get("/auth/supabase", (req, res) => {
    if (req.accepts('html')) {
        const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, '');
        return res.redirect(`${frontendUrl}/login`);
    }
    res.status(405).json({
        error: "Method Not Allowed",
        message: "Use POST /api/auth/supabase with accessToken in body"
    });
});

// ─── POST /api/auth/supabase (Supabase Access Token Verification) ─────────────
router.post("/auth/supabase", rateLimiter(20, 15 * 60 * 1000, "Too many authentication attempts. Please wait a few minutes."), async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({ error: "Supabase access token is required." });
    }

    if (!supabaseAdmin) {
        return res.status(503).json({
            error: "Supabase Not Configured",
            message: "Supabase authentication is not configured on this server."
        });
    }

    try {
        // Verify the Supabase JWT via the service role client
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);

        if (error || !user) {
            return res.status(401).json({
                error: "Invalid Supabase Token",
                message: error?.message || "Could not verify Supabase access token."
            });
        }

        const email = (user.email || "").trim().toLowerCase();
        if (!email) {
            return res.status(401).json({
                error: "Invalid Supabase Token",
                message: "No email associated with this Supabase account."
            });
        }

        // Extract metadata
        const name = user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
        const picture = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        const supabaseUid = user.id;

        let dbUser = await userRepo.findByEmail(email);
        if (!dbUser) {
            dbUser = await userRepo.createUser({
                email,
                name,
                authProvider: 'supabase',
                firebaseUid: supabaseUid,   // reuse existing column for Supabase UID
                avatar: picture,
            });
        } else {
            dbUser = await userRepo.updateUser(dbUser.id, {
                name: name || dbUser.name,
                avatar: picture || dbUser.avatar,
                lastLogin: new Date(),
                loginAttempts: 0,
                lockUntil: null,
            });
        }

        const { accessToken: jwtAccess, refreshToken: jwtRefresh } = generateTokens(dbUser);
        await refreshTokenRepo.storeRefreshToken(dbUser.id, jwtRefresh);

        res.json({
            status: "logged_in",
            accessToken: jwtAccess,
            refreshToken: jwtRefresh,
            user: {
                id: dbUser.id,
                _id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                avatar: dbUser.avatar,
            },
        });
    } catch (err) {
        console.error("[supabase-auth] ❌ Error:", err.message);
        res.status(401).json({
            error: "Supabase authentication failed",
            message: process.env.NODE_ENV === 'production' ? "Authentication failed. Please sign in again." : err.message
        });
    }
});

// ─── POST /api/auth/google (Google GIS / OAuth2 Token Verification) ───────────
router.post("/auth/google", rateLimiter(20, 15 * 60 * 1000, "Too many authentication attempts. Please wait a few minutes."), async (req, res) => {
    const { idToken, credential, accessToken: googleAccessToken } = req.body;
    const token = idToken || credential;

    if (!token && !googleAccessToken) {
        return res.status(400).json({ error: "Google token (accessToken or idToken) is required." });
    }

    try {
        let email, name, picture, googleUid;

        if (googleAccessToken) {
            // Verify and retrieve user profile via Google OAuth2 userinfo endpoint
            const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${googleAccessToken}` }
            });
            if (!userinfoRes.ok) {
                const errBody = await userinfoRes.text();
                throw new Error(`Google userinfo request failed: ${errBody}`);
            }
            const info = await userinfoRes.json();
            email = (info.email || '').trim().toLowerCase();
            name = info.name || email.split('@')[0];
            picture = info.picture || null;
            googleUid = info.sub;
        } else {
            // Verify via Google tokeninfo endpoint
            const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
            if (!googleRes.ok) {
                const errBody = await googleRes.text();
                throw new Error(`Google token verification failed: ${errBody}`);
            }

            const payload = await googleRes.json();
            const expectedClientId = process.env.GOOGLE_CLIENT_ID || '925614040769-v08v237i2n77d3tqtm3c2o00bgpm3qal.apps.googleusercontent.com';
            if (payload.aud !== expectedClientId && payload.azp !== expectedClientId) {
                console.warn(`[google-auth] Audience mismatch warning. Expected: ${expectedClientId}, got aud: ${payload.aud}`);
            }

            email = (payload.email || '').trim().toLowerCase();
            name = payload.name || email.split('@')[0];
            picture = payload.picture || null;
            googleUid = payload.sub;
        }

        if (!email) {
            return res.status(401).json({ error: "No email address found in Google account profile." });
        }

        let dbUser = await userRepo.findByEmail(email);
        if (!dbUser) {
            dbUser = await userRepo.createUser({
                email,
                name,
                authProvider: 'google',
                firebaseUid: googleUid,
                avatar: picture,
            });
        } else {
            dbUser = await userRepo.updateUser(dbUser.id, {
                name: name || dbUser.name,
                avatar: picture || dbUser.avatar,
                lastLogin: new Date(),
                loginAttempts: 0,
                lockUntil: null,
            });
        }

        const { accessToken, refreshToken } = generateTokens(dbUser);
        await refreshTokenRepo.storeRefreshToken(dbUser.id, refreshToken);

        res.json({
            status: "logged_in",
            accessToken,
            refreshToken,
            user: {
                id: dbUser.id,
                _id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                avatar: dbUser.avatar,
            },
        });
    } catch (err) {
        console.error("[google-auth] ❌ Error:", err.message);
        res.status(401).json({
            error: "Google authentication failed",
            message: process.env.NODE_ENV === 'production' ? "Google authentication failed. Please try again." : err.message
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
            
            console.error(`[AI-Service] ⚠️ Attempt ${attempt}/${maxRetries} failed:`, {
                type: errorType,
                status: err.response?.status,
                message: err.message,
                endpoint: PYTHON_URL_ENDPOINT
            });
            
            // If service is completely offline or refused, fail immediately so fallback can engage instantly
            if (err.code === "ECONNREFUSED") {
                throw err;
            }

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
        let aiData;
        try {
            aiData = await callAIServiceWithRetry(sanitizedText, 2, 800);
        } catch (aiErr) {
            console.warn(`[upload-resume] ⚠️ Python AI service unreachable (${aiErr.message}). Engaging built-in local AI engine fallback.`);
            try {
                aiData = localAiEngine.analyzeResume(sanitizedText);
            } catch (fallbackErr) {
                console.error("[upload-resume] ❌ Fallback local engine error:", fallbackErr.message);
                return res.status(500).json({
                    error: "Analysis failed",
                    message: "Could not analyze resume text. Please check the content and try again."
                });
            }
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
    const resume = req.body.resume || req.body.text;
    const { target_role } = req.body;
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

        let atsData;
        try {
            const aiRes = await axios.post(
                `${PYTHON_URL}/ats-check`,
                { resume: resume.trim(), target_role },
                { timeout: 10000, headers }
            );
            atsData = aiRes.data;
        } catch (err) {
            console.warn(`[ats-check] ⚠️ Python AI unreachable (${err.message}). Engaging built-in local ATS engine.`);
            atsData = localAiEngine.atsCheck(resume.trim(), target_role);
        }

        res.json(atsData);
    } catch (err) {
        console.error("[ats-check] ❌ Error:", err.message);
        res.status(500).json({
            error: "ATS Check Failed",
            message: "Could not complete ATS check at this time."
        });
    }
});

module.exports = router;
