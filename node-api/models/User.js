const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: String,
    googleId: String,
    avatar: String,
    resumeText: String,
    skills: [String],
    readinessScore: Number,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
