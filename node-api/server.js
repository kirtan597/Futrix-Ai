require("dotenv").config(); // Must be first before any process.env usage

const express = require("express");
const cors = require("cors");
const { startWarmer } = require("./utils/serviceWarmer");
const { checkDbConnection } = require("./db/supabaseClient");

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

// ─── Database Initialization ─────────────────────────────────────────────────
async function initDatabase() {
    try {
        const { isConnected, error } = await checkDbConnection();
        if (isConnected) {
            console.log("✅ PostgreSQL (Supabase) connected successfully");
        } else {
            console.warn(`⚠️ PostgreSQL (Supabase) status: ${error || 'Not ready'}`);
        }
    } catch (err) {
        console.error(`❌ PostgreSQL (Supabase) connection check error: ${err.message}`);
    }
}

initDatabase();

// ─── Root endpoint ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Futrix AI Node API v2.1.0 (PostgreSQL / Supabase)",
        endpoints: {
            health: "GET /health",
            auth: ["POST /api/login", "POST /api/auth/firebase", "POST /api/auth/refresh", "POST /api/auth/logout", "GET /api/auth/verify"],
            analysis: ["POST /api/upload-resume", "GET /api/history", "GET /api/compare"],
            jobs: ["POST /api/jobs/match"],
            ats: ["POST /api/ats-check"],
            profile: ["GET /api/profile", "PUT /api/profile"]
        }
    });
});

// Routes
app.use("/api", require("./routes/userRoutes"));

// ─── Health check endpoint ────────────────────────────────────────────────────
app.get("/health", async (req, res) => {
    const pythonUrl = (process.env.PYTHON_URL || "http://localhost:8000").replace(/\/$/, '');
    const isPythonConfigured = pythonUrl !== 'http://localhost:8000' && process.env.NODE_ENV !== 'development';
    
    let dbStatus = "connected";
    try {
        const { isConnected } = await checkDbConnection();
        dbStatus = isConnected ? "connected" : "degraded";
    } catch {
        dbStatus = "disconnected";
    }

    const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
        environment: process.env.NODE_ENV || "development",
        version: "2.1.0",
        services: {
            auth: "operational",
            analysis: "operational",
            database: dbStatus === "connected" ? "operational" : "degraded",
            python_ai: isPythonConfigured ? "configured" : "development",
        }
    };

    res.status(200).json(health);
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
