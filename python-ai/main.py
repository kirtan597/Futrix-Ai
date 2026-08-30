from fastapi import FastAPI, HTTPException, Header, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
import logging
from ai_engine import analyze_resume, score_breakdown, career_paths, compare_analyses, ats_check

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("futrix-ai-engine")

app = FastAPI(title="Futrix AI Engine", version="2.1.0")

_extra = os.getenv("ALLOWED_ORIGINS", "")
_prod_origins = [o.strip() for o in _extra.split(",") if o.strip()]

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "https://futrixai.netlify.app",
    "https://futrix-node-api.onrender.com",
] + _prod_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET")

def verify_internal_secret(x_internal_secret: Optional[str] = Header(None)):
    if INTERNAL_API_SECRET:
        if not x_internal_secret or x_internal_secret != INTERNAL_API_SECRET:
            logger.warning("Unauthorized access attempt to python-ai: missing or invalid X-Internal-Secret")
            raise HTTPException(status_code=401, detail="Unauthorized: invalid or missing internal service secret")
    return True

# ─── Request / Response models ────────────────────────────────────────────────

class ResumeData(BaseModel):
    resume: str = Field(..., min_length=50, max_length=50000)

class ATSCheckData(BaseModel):
    resume: str = Field(..., min_length=50, max_length=50000)
    target_role: Optional[str] = None

class CompareData(BaseModel):
    resume_a: str = Field(..., min_length=50, max_length=50000)
    resume_b: str = Field(..., min_length=50, max_length=50000)

class CareerPathRequest(BaseModel):
    skills: List[str] = Field(..., min_items=1, max_items=100)

# ─── Health Endpoints (Public) ────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "status": "Futrix AI Engine v2.1 running 🐍",
        "endpoints": ["/analyze", "/score-breakdown", "/career-path", "/compare", "/ats-check"]
    }

@app.get("/health")
def health():
    return {"status": "ok"}

# ─── Protected Service Endpoints ─────────────────────────────────────────────

@app.post("/analyze", dependencies=[Depends(verify_internal_secret)])
def analyze(data: ResumeData):
    text = data.resume.strip()
    if len(text) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short. Please provide at least 50 characters.")
    
    logger.info(f"Analyzing resume (text length: {len(text)} chars)")
    result = analyze_resume(text)
    result["score_breakdown"] = score_breakdown(result["skills"])
    result["career_paths"]    = career_paths(result["skills"])
    return result

@app.post("/ats-check", dependencies=[Depends(verify_internal_secret)])
def check_ats(data: ATSCheckData):
    text = data.resume.strip()
    if len(text) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short. Please provide at least 50 characters.")
    
    logger.info(f"Running ATS check (text length: {len(text)} chars, target_role: {data.target_role})")
    result = ats_check(text, target_role=data.target_role)
    return result

@app.post("/score-breakdown", dependencies=[Depends(verify_internal_secret)])
def get_score_breakdown(data: ResumeData):
    text = data.resume.strip()
    if len(text) < 50:
        raise HTTPException(status_code=400, detail="Resume text is too short. Please provide at least 50 characters.")
    
    logger.info(f"Computing score breakdown (text length: {len(text)} chars)")
    result = analyze_resume(text)
    return {
        "readiness_score": result["readiness_score"],
        "breakdown":       score_breakdown(result["skills"]),
    }

@app.post("/career-path", dependencies=[Depends(verify_internal_secret)])
def get_career_path(data: CareerPathRequest):
    logger.info(f"Computing career paths for {len(data.skills)} skills")
    return {"career_paths": career_paths(data.skills)}

@app.post("/compare", dependencies=[Depends(verify_internal_secret)])
def compare(data: CompareData):
    text_a = data.resume_a.strip()
    text_b = data.resume_b.strip()
    logger.info(f"Comparing resumes (length A: {len(text_a)}, length B: {len(text_b)})")
    a = analyze_resume(text_a)
    b = analyze_resume(text_b)
    return compare_analyses(a, b)
