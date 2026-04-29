require("dotenv").config(); // Must be first before any process.env usage

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// CORS configuration for OAuth and development
const corsOptions = {
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://127.0.0.1:5173'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors(corsOptions));

// Connect to MongoDB with better error handling
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/futrixai";
mongoose.connect(mongoUri)
    .then(() => {
        console.log("✅ MongoDB connected successfully");
        console.log(`   Database: ${mongoUri}`);
    })
    .catch(err => {
        console.error("❌ MongoDB connection error:", err.message);
        console.error("   Please ensure MongoDB is running on localhost:27017");
        process.exit(1);
    });

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Node API running on port ${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
