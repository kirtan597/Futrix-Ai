const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
    email: { type: String, required: true, index: true },
    resumeText:      { type: String },
    skills:          { type: [String], default: [] },
    gap_skills:      { type: [String], default: [] },
    readiness_score: { type: Number, default: 0 },
    roadmap:         { type: [String], default: [] },
    score_breakdown: {
        skill_match:    Number,
        stack_balance:  Number,
        cloud_presence: Number,
        devops_score:   Number,
        language_div:   Number,
    },
    career_paths: [
        {
            role:          String,
            match_percent: Number,
            salary_range:  String,
            skills_needed: [String],
        },
    ],
}, { timestamps: true });

// Index for history queries sorted by date
analysisSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model("Analysis", analysisSchema);
