"""
CareerTwin AI Engine
Pure Python skill extraction — no spaCy needed.
spaCy was causing Pydantic v1/v2 conflicts on startup.
"""
import json
import os
from typing import List, Dict

# Load skills database
try:
    _db_path = os.path.join(os.path.dirname(__file__), 'skills_db.json')
    with open(_db_path, 'r') as f:
        KNOWN_SKILLS: List[str] = json.load(f)
except Exception:
    KNOWN_SKILLS = [
        "Java", "Python", "JavaScript", "TypeScript", "React", "Node.js",
        "Docker", "Kubernetes", "MongoDB", "SQL", "AWS", "Git"
    ]


def analyze_resume(text: str) -> Dict:
    text_lower = text.lower()

    # ── 1. Extract skills via keyword matching ────────────────────────────────
    found_skills = [skill for skill in KNOWN_SKILLS if skill.lower() in text_lower]

    # ── 2. Gap analysis ───────────────────────────────────────────────────────
    skill_set = set(found_skills)
    gaps = []

    if "React" in skill_set and "Node.js" not in skill_set and "Java" not in skill_set:
        gaps.append("Node.js or Java (Backend)")
    if "Python" in skill_set and "Machine Learning" not in skill_set:
        gaps.append("Machine Learning")
    if "Docker" not in skill_set and "Kubernetes" not in skill_set:
        gaps.append("Containerization (Docker/Kubernetes)")
    if "Git" not in skill_set:
        gaps.append("Version Control (Git)")
    if "AWS" not in skill_set and "Azure" not in skill_set:
        gaps.append("Cloud Platform (AWS or Azure)")
    if not gaps:
        gaps.append("Advanced System Design")

    # ── 3. Readiness score ────────────────────────────────────────────────────
    score = min(100, len(found_skills) * 10 + 20)

    # ── 4. Learning roadmap ───────────────────────────────────────────────────
    roadmap = [f"Learn {gap}" for gap in gaps]
    if len(roadmap) < 3:
        roadmap.append("Build a production-grade full-stack project")
    if len(roadmap) < 4:
        roadmap.append("Contribute to Open Source on GitHub")
    roadmap.append("Prepare for System Design interviews")

    return {
        "skills": found_skills,
        "gap_skills": gaps,
        "readiness_score": score,
        "roadmap": roadmap,
    }
