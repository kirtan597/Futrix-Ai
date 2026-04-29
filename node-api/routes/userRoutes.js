const express  = require("express");
const axios    = require("axios");
const { OAuth2Client } = require("google-auth-library");
const router   = express.Router();

const User     = require("../models/User");
const Analysis = require("../models/Analysis");
const auth     = require("../middleware/auth");
const rateLimiter = require("../middleware/rateLimiter");
const { generateTokens, verifyRefreshToken } = require("../utils/authUtils");

const PYTHON_URL  = process.env.PYTHON_URL  || "http://localhost:8000";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── POST /api/login ──────────────────────────────────────────────────────────
router.post("/login", rateLimiter(5, 15 * 60 * 1000), async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
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
router.post("/auth/google", rateLimiter(10, 15 * 60 * 1000), async (req, res) => {
    console.log('=== BACKEND: Google OAuth Request Received ===');
    console.log('Request body:', req.body);
    
    const { credential } = req.body;
    if (!credential) {
        console.error('No credential in request body');
        return res.status(400).json({ error: "Google credential is required." });
    }
    
    console.log('Credential received, length:', credential.length);
    console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
    
    try {
        console.log('Verifying ID token with Google...');
        // Verify Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log('Token verified! Payload:', { email: payload.email, sub: payload.sub, email_verified: payload.email_verified });
        
        const { email, sub, name, picture, email_verified } = payload;

        // Check if email is verified
        if (!email_verified) {
            console.error('Email not verified:', email);
            return res.status(403).json({ 
                error: "Email not verified", 
                message: "Please verify your email with Google first." 
            });
        }

        console.log('Finding/creating user for email:', email);
        let user = await User.findOne({ email });
        
        if (!user) {
            console.log('Creating new user...');
            // Create new user
            user = await User.create({
                email,
                name: name || email.split('@')[0],
                googleId: sub,
                avatar: picture,
                lastLogin: new Date()
            });
            console.log('New user created:', user._id);
        } else {
            console.log('Existing user found:', user._id);
            // Update existing user with Google info
            if (!user.googleId) {
                user.googleId = sub;
            }
            user.name = name || user.name;
            user.avatar = picture || user.avatar;
            user.lastLogin = new Date();
            
            // Reset login attempts on successful login
            if (user.loginAttempts > 0) {
                await user.resetLoginAttempts();
            }
            
            await user.save();
            console.log('User updated');
        }

        console.log('Generating tokens...');
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user);
        
        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

        console.log('Sending success response');
        const response = { 
            status: "logged_in", 
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                avatar: user.avatar
            }
        };
        console.log('Response:', { ...response, accessToken: 'HIDDEN', refreshToken: 'HIDDEN' });
        console.log('=== BACKEND: Google OAuth Success ===');
        
        res.json(response);
    } catch (err) {
        console.error("[google-auth] ERROR:", err);
        console.error("Error stack:", err.stack);
        
        if (err.message && err.message.includes("Token used too late")) {
            return res.status(401).json({ 
                error: "Token expired", 
                message: "Google token has expired. Please try again." 
            });
        }
        
        res.status(500).json({ 
            error: "Google authentication failed",
            message: err.message || "Unable to verify Google credentials. Please try again."
        });
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
router.post("/auth/logout", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (user) {
            // Clear refresh token
            user.refreshToken = null;
            await user.save();
        }
        
        res.json({ 
            status: "logged_out",
            message: "Successfully logged out"
        });
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

// ─── POST /api/upload-resume ──────────────────────────────────────────────────
router.post("/upload-resume", auth, async (req, res) => {
    const { text, email } = req.body;
    if (!text || text.trim().length < 50) {
        return res.status(400).json({ error: "Resume text is too short. Please provide at least 50 characters." });
    }
    try {
        // Call Python AI engine
        const aiRes = await axios.post(`${PYTHON_URL}/analyze`, { resume: text }, { timeout: 25_000 });
        const aiData = aiRes.data;

        // Persist analysis to MongoDB
        const saved = await Analysis.create({
            email:           email || req.user?.email,
            resumeText:      text,
            skills:          aiData.skills          || [],
            gap_skills:      aiData.gap_skills       || [],
            readiness_score: aiData.readiness_score  || 0,
            roadmap:         aiData.roadmap          || [],
            score_breakdown: aiData.score_breakdown  || null,
            career_paths:    aiData.career_paths     || [],
        });

        res.json({ ...aiData, _id: saved._id });
    } catch (err) {
        console.error("[upload-resume]", err.message);
        if (err.code === "ECONNREFUSED") {
            return res.status(503).json({ error: "Python AI engine is not running on port 8000." });
        }
        res.status(500).json({ error: "Analysis failed. Please try again." });
    }
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
