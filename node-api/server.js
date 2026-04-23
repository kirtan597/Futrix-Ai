const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

require("dotenv").config();

// CORS configuration for OAuth
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(express.json());
app.use(cors(corsOptions));

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/futrixai")
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err.message));

app.use("/api", require("./routes/userRoutes"));

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Node API running on port ${PORT}`));
