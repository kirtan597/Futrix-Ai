require("dotenv").config(); // Must be first before any process.env usage

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// CORS — allow localhost dev + any deployed frontend URL
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL,                   // Vercel production URL
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
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
    const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        environment: process.env.NODE_ENV || "development",
        version: "2.0.0",
        services: {
            auth: "operational",
            analysis: "operational",
            database: mongoose.connection.readyState === 1 ? "operational" : "down"
        }
    };
    
    const statusCode = mongoose.connection.readyState === 1 ? 200 : 503;
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

// Export for Vercel serverless
module.exports = app;

// Local development server
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Node API running on port ${PORT}`);
        console.log(`   Health check: http://localhost:${PORT}/health`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}
