from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from ai_engine import analyze_resume, score_breakdown, career_paths, compare_analyses

app = FastAPI(title="CareerTwin AI Engine", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request / Response models ────────────────────────────────────────────────

class ResumeData(BaseModel):
    resume: str

class CompareData(BaseModel):
    resume_a: str
    resume_b: str

class CareerPathRequest(BaseModel):
    skills: List[str]

# ─── Health ───────────────────────────────────────────────────────────────────

@app.get("/")
def health():
    return {"status": "CareerTwin AI Engine v2.0 running 🐍", "endpoints": [
        "/analyze", "/score-breakdown", "/career-path", "/compare"
    ]}

# ─── POST /analyze — full resume analysis ────────────────────────────────────

@app.post("/analyze")
def analyze(data: ResumeData):
    if not data.resume or len(data.resume.strip()) < 10:
        raise HTTPException(status_code=400, detail="Resume text is too short.")
    result = analyze_resume(data.resume)
    # Enrich with breakdown & career paths
    result["score_breakdown"] = score_breakdown(result["skills"])
    result["career_paths"]    = career_paths(result["skills"])
    return result

# ─── POST /score-breakdown — detailed score components ───────────────────────

@app.post("/score-breakdown")
def get_score_breakdown(data: ResumeData):
    result = analyze_resume(data.resume)
    return {
        "readiness_score": result["readiness_score"],
        "breakdown":       score_breakdown(result["skills"]),
    }

# ─── POST /career-path — role matches for a skill list ───────────────────────

@app.post("/career-path")
def get_career_path(data: CareerPathRequest):
    return {"career_paths": career_paths(data.skills)}

# ─── POST /compare — two resumes, return delta ───────────────────────────────

@app.post("/compare")
def compare(data: CompareData):
    a = analyze_resume(data.resume_a)
    b = analyze_resume(data.resume_b)
    return compare_analyses(a, b)
