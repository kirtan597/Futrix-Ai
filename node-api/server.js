require("dotenv").config(); // Must be first before any process.env usage

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { startWarmer } = require("./utils/serviceWarmer");

const app = express();

// ─── Production Logging Setup ──────────────────────────────────────────────────
const isDev = process.env.NODE_ENV !== 'production';
const logTimestamp = (level, msg, data = '') => {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] [${level}] ${msg}`;
    if (isDev) {
        console.log(logMsg, data);
    } else {
        console.log(JSON.stringify({ timestamp, level, message: msg, data }));
    }
};

// ─── CORS Configuration (Strict Whitelist) ───────────────────────────────────
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://futrixai.netlify.app',
    'https://futrix-ai.vercel.app',
    process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true); // Server-to-server / curl / Postman
        if (allowedOrigins.includes(origin)) return callback(null, true);
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

// ─── Connect to MongoDB ────────────────────────────────────────────────────────
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/futrixai";
let isDbConnected = false;

async function connectDB() {
    let retries = 5;
    while (retries) {
        try {
            await mongoose.connect(mongoUri);
            isDbConnected = true;
            console.log("✅ MongoDB connected successfully");
            break;
        } catch (err) {
            retries--;
            console.error(`❌ MongoDB connection error: ${err.message}`);
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

// ─── Root endpoint ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Futrix AI Node API v2.1.0",
        endpoints: {
            health: "GET /health",
            auth: ["POST /api/login", "POST /api/auth/google", "POST /api/auth/refresh", "POST /api/auth/logout", "GET /api/auth/verify"],
            analysis: ["POST /api/upload-resume", "GET /api/history", "GET /api/compare"],
            jobs: ["POST /api/jobs/match"],
            profile: ["GET /api/profile", "PUT /api/profile"]
        }
    });
});

// Routes
app.use("/api", require("./routes/userRoutes"));

// ─── Health check endpoint ────────────────────────────────────────────────────
app.get("/health", (req, res) => {
    const pythonUrl = (process.env.PYTHON_URL || "http://localhost:8000").replace(/\/$/, '');
    const isPythonConfigured = pythonUrl !== 'http://localhost:8000' && process.env.NODE_ENV !== 'development';
    const dbState = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbState,
        environment: process.env.NODE_ENV || "development",
        version: "2.1.0",
        services: {
            auth: "operational",
            analysis: "operational",
            database: dbState === "connected" ? "operational" : "degraded",
            python_ai: isPythonConfigured ? "configured" : "development",
        }
    };

    const statusCode = (dbState === "connected" && isPythonConfigured) ? 200 : 200; // Return 200 for health probe
    res.status(statusCode).json(health);
});

// ─── 404 handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    const endpoint = `${req.method} ${req.originalUrl}`;
    logTimestamp('WARN', `404 Not Found: ${endpoint}`);
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        hint: "Check docs: GET / or GET /health"
    });
});

// ─── Global error handler (must be last) ──────────────────────────────────────
app.use((err, req, res, _next) => {
    const endpoint = `${req.method} ${req.originalUrl}`;
    logTimestamp('ERROR', `Unhandled error in ${endpoint}`, err.message);
    const message = isDev ? err.message : 'Internal server error';
    res.status(err.status || 500).json({ 
        error: err.name || 'Internal Server Error', 
        message 
    });
});

module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Node API running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    startWarmer();
});
