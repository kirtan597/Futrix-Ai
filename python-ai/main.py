from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_engine import analyze_resume

app = FastAPI(title="CareerTwin AI Engine", version="1.0.0")

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResumeData(BaseModel):
    resume: str

@app.get("/")
def health():
    return {"status": "CareerTwin AI Engine is running 🐍"}

@app.post("/analyze")
def analyze(data: ResumeData):
    return analyze_resume(data.resume)
