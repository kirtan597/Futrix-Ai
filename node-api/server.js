const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

require("dotenv").config();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/careertwin")
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err.message));

app.use("/api", require("./routes/userRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Node API running on port ${PORT}`));
