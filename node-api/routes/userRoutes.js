const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "CareerTwinSuperSecretKey_32chars!!";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000/analyze";

const auth = require("../middleware/auth");

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// Issues a JWT directly from Node.js (same secret as Java Gateway).
// Works whether or not the Java service is running.
router.post("/login", (req, res) => {
    const email = req.body.email;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    const token = jwt.sign({ sub: email, email }, JWT_SECRET, { expiresIn: "10d" });
    res.json({ status: "logged_in", token, email });
});

// ─── TOKEN VERIFICATION (debug helper) ───────────────────────────────────────
router.get("/verify-token", auth, (req, res) => {
    res.json({ valid: true, user: req.user });
});

// ─── UPLOAD RESUME ────────────────────────────────────────────────────────────
router.post("/upload-resume", auth, async (req, res) => {
    try {
        const { text, email } = req.body;

        if (!text || text.trim().length < 10) {
            return res.status(400).json({ error: "Resume text is required (min 10 chars)" });
        }

        // Call Python AI Service
        const aiRes = await axios.post(AI_SERVICE_URL, { resume: text });
        const aiData = aiRes.data;

        // Save/update in MongoDB if email is provided
        if (email) {
            await User.findOneAndUpdate(
                { email },
                { email, resumeText: text, skills: aiData.skills, readinessScore: aiData.readiness_score },
                { upsert: true, new: true }
            );
        }

        res.json(aiData);
    } catch (error) {
        console.error("Error processing resume:", error.message);
        if (error.code === "ECONNREFUSED") {
            return res.status(503).json({ error: "AI service is not running. Start Python on port 8000." });
        }
        res.status(500).json({ error: "Internal Server Error", detail: error.message });
    }
});

module.exports = router;
