require("dotenv").config(); // Must be first before any process.env usage

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto"); // Fix: explicit crypto import for Node 18

const app = express();

// ─── Production Logging Setup ──────────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
const logWithTimestamp = (level, msg, data = '') => {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] [${level}] ${msg}`;
    if (isDev) {
        console.log(logMsg, data);
    } else {
        // Production: structured logging
        console.log(JSON.stringify({ timestamp, level, message: msg, data }));
    }
};

const logError = (msg, err) => logWithTimestamp('ERROR', msg, err?.message || err);
const logInfo = (msg, data) => logWithTimestamp('INFO', msg, data);
const logWarn = (msg, data) => logWithTimestamp('WARN', msg, data);

// ─── CORS Configuration ────────────────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://futrixai.netlify.app',
    'https://futrix-ai.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // curl / Postman / mobile
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow any Vercel preview deploy or Netlify branch deploy
        if (origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app')) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};



app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors(corsOptions));

// Connect to MongoDB with better error handling
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/futrixai";

async function connectDB() {
    let retries = 5;
    while (retries) {
        try {
            await mongoose.connect(mongoUri);
            console.log("✅ MongoDB connected successfully");
            break;
        } catch (err) {
            retries--;
            console.error(`❌ MongoDB connection error: ${err.message}`);
            if (err.message.includes('ENOTFOUND') || err.message.includes('querySrv')) {
                console.error("   ⚠️  Cannot reach MongoDB Atlas. Check:");
                console.error("   1. Your IP is whitelisted in Atlas Network Access");
                console.error("   2. Username/password in MONGO_URI is correct");
                console.error("   3. Internet connection is working");
                console.error("   💡 Falling back to local MongoDB...");
                // Try local MongoDB as fallback
                try {
                    await mongoose.connect("mongodb://localhost:27017/futrixai");
                    console.log("✅ Connected to LOCAL MongoDB as fallback");
                    break;
                } catch (localErr) {
                    console.error("❌ Local MongoDB also failed:", localErr.message);
                    console.error("   Please start MongoDB: mongod");
                }
            }
            if (retries === 0) {
                console.error("❌ All MongoDB connection attempts failed. Server running WITHOUT database.");
            } else {
                console.log(`   Retrying in 3 seconds... (${retries} retries left)`);
                await new Promise(r => setTimeout(r, 3000));
            }
        }
    }
}

connectDB();

// Routes
app.use("/api", require("./routes/userRoutes"));

// Enhanced health check endpoint
app.get("/health", (req, res) => {
    const pythonUrl = (process.env.PYTHON_URL || "http://localhost:8000").replace(/\/$/, '');
    const isPythonConfigured = pythonUrl !== 'http://localhost:8000' && process.env.NODE_ENV !== 'development';
    
    const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        environment: process.env.NODE_ENV || "development",
        version: "2.0.1",
        services: {
            auth: "operational",
            analysis: "operational",
            database: mongoose.connection.readyState === 1 ? "operational" : "down",
            python_ai: isPythonConfigured ? "configured" : "not-configured"
        }
    };
    
    const statusCode = (mongoose.connection.readyState === 1 && isPythonConfigured) ? 200 : 503;
    res.status(statusCode).json(health);
});

// 404 handler (Express 5 compatible — no wildcard '*')
app.use('/{*path}', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableRoutes: [
            'GET /health',
            'POST /api/login',
            'POST /api/auth/google',
            'POST /api/auth/refresh',
            'POST /api/auth/logout',
            'GET /api/auth/verify',
            'POST /api/upload-resume',
            'GET /api/history',
            'POST /api/jobs/match'
        ]
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Export for serverless (Vercel etc.)
module.exports = app;

// Always start the HTTP server — Render and all other platforms need this
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Node API running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
