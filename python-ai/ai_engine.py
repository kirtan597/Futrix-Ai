"""
Futrix AI Engine v2.1
Strict text-bounded skill extraction + scoring + career path matching.
Only detects skills that are actually present in the resume text.
All analysis is derived strictly from the pasted text — no hallucination.
"""
import json
import os
import re
from typing import List, Dict, Any, Set

# ─── Skills database ──────────────────────────────────────────────────────────
try:
    _db_path = os.path.join(os.path.dirname(__file__), 'skills_db.json')
    with open(_db_path, 'r') as f:
        KNOWN_SKILLS: List[str] = json.load(f)
except Exception:
    KNOWN_SKILLS = [
        "Java", "Python", "JavaScript", "TypeScript", "React", "Node.js",
        "Vue", "Angular", "Django", "Flask", "FastAPI", "Spring Boot",
        "Docker", "Kubernetes", "MongoDB", "PostgreSQL", "MySQL", "Redis",
        "SQL", "AWS", "Azure", "GCP", "Git", "GitHub", "CI/CD",
        "REST API", "GraphQL", "Machine Learning", "TensorFlow", "PyTorch",
        "Linux", "Terraform", "Ansible", "Nginx", "Apache Kafka",
        "Microservices", "Agile", "Scrum", "Go", "Rust", "C++", "C#",
        "Spark", "Airflow", "Hadoop", "Elasticsearch", "RabbitMQ",
    ]

# ─── Ambiguous short terms that need word-boundary matching ───────────────────
# These short terms can easily cause false positives with substring matching
# (e.g. "Go" in "Google", "AI" in "email", "R" in "React").
_BOUNDARY_SKILLS = {"Go", "AI", "R", "C", "C#", "C++", "SQL", "GCP", "CSS", "HTML"}


def _skill_present(skill: str, text: str) -> bool:
    """
    Check if a skill is genuinely present in the resume text.
    Uses word-boundary regex for short/ambiguous terms to prevent false positives.
    Uses case-insensitive substring match for longer, unambiguous terms.
    """
    if skill in _BOUNDARY_SKILLS:
        # Escape for regex (handles C++, C#, etc.)
        escaped = re.escape(skill)
        # Word-boundary match, case-insensitive
        pattern = rf'(?<![a-zA-Z]){escaped}(?![a-zA-Z])'
        return bool(re.search(pattern, text, re.IGNORECASE))
    else:
        # Standard case-insensitive substring match for unambiguous multi-char terms
        return skill.lower() in text.lower()


# ─── Role catalog for career path matching ────────────────────────────────────
ROLE_CATALOG = [
    {
        "role":          "Frontend Engineer",
        "salary_range":  "$85k–$130k",
        "skills_needed": ["React", "TypeScript", "JavaScript", "CSS", "HTML"],
    },
    {
        "role":          "Full Stack Developer",
        "salary_range":  "$90k–$145k",
        "skills_needed": ["React", "Node.js", "MongoDB", "REST API", "Docker"],
    },
    {
        "role":          "Backend Engineer",
        "salary_range":  "$95k–$150k",
        "skills_needed": ["Node.js", "Python", "MongoDB", "Docker", "AWS"],
    },
    {
        "role":          "DevOps Engineer",
        "salary_range":  "$100k–$160k",
        "skills_needed": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux"],
    },
    {
        "role":          "Data Engineer",
        "salary_range":  "$105k–$155k",
        "skills_needed": ["Python", "SQL", "Spark", "AWS", "Airflow"],
    },
    {
        "role":          "ML Engineer",
        "salary_range":  "$120k–$180k",
        "skills_needed": ["Python", "Machine Learning", "TensorFlow", "Docker"],
    },
    {
        "role":          "Cloud Architect",
        "salary_range":  "$130k–$200k",
        "skills_needed": ["AWS", "Kubernetes", "Terraform", "Docker"],
    },
]


# ─── Core analysis (strict text-bounded) ─────────────────────────────────────
def analyze_resume(text: str) -> Dict[str, Any]:
    """
    Analyzes resume text using ONLY the content provided.
    - Skills: only those explicitly found in the text via precise matching
    - Gaps: only suggested relative to the skills actually detected
    - Score: calculated solely from what was found
    - Roadmap: generated only from identified gaps
    """
    # 1. Strict skill extraction — only skills genuinely present in text
    found_skills: List[str] = [s for s in KNOWN_SKILLS if _skill_present(s, text)]
    found_skills_set: Set[str] = set(found_skills)

    # 2. Context-aware gap analysis
    #    Gaps are only suggested when they are logically related to the
    #    skills already detected. We never suggest gaps for unrelated domains.
    gaps: List[str] = []

    # Determine what domain the user is in based on their actual skills
    has_frontend = bool(found_skills_set & {"React", "Vue", "Angular", "JavaScript", "TypeScript", "HTML", "CSS"})
    has_backend  = bool(found_skills_set & {"Node.js", "Python", "Java", "Django", "Flask", "FastAPI", "Spring Boot", "Express"})
    has_devops   = bool(found_skills_set & {"Docker", "Kubernetes", "CI/CD", "Terraform", "Ansible", "Linux"})
    has_cloud    = bool(found_skills_set & {"AWS", "Azure", "GCP"})
    has_data     = bool(found_skills_set & {"SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis"})
    has_ml       = bool(found_skills_set & {"Machine Learning", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy"})

    # Only suggest gaps in domains the user is actually working in
    if has_frontend:
        if "TypeScript" not in found_skills_set and "JavaScript" in found_skills_set:
            gaps.append("TypeScript")
        if "React" not in found_skills_set and "Vue" not in found_skills_set and "Angular" not in found_skills_set:
            gaps.append("React or Vue or Angular (Component Framework)")

    if has_backend:
        if "Docker" not in found_skills_set:
            gaps.append("Docker")
        if not has_data:
            gaps.append("Database (SQL/MongoDB)")

    if has_backend or has_frontend:
        if "Git" not in found_skills_set and "GitHub" not in found_skills_set:
            gaps.append("Git (Version Control)")
        if not has_cloud:
            gaps.append("Cloud Platform (AWS/Azure/GCP)")
        if "CI/CD" not in found_skills_set and "GitHub" not in found_skills_set and "DevOps" not in found_skills_set:
            gaps.append("CI/CD Pipeline")
        if "REST API" not in found_skills_set and "GraphQL" not in found_skills_set and has_backend:
            gaps.append("REST API or GraphQL")

    if has_devops:
        if "Kubernetes" not in found_skills_set and "Docker" in found_skills_set:
            gaps.append("Kubernetes")
        if not has_cloud:
            gaps.append("Cloud Platform (AWS/Azure/GCP)")

    if has_ml:
        if "Docker" not in found_skills_set:
            gaps.append("Docker (Model Deployment)")
        if not has_cloud:
            gaps.append("Cloud Platform for ML (AWS SageMaker / GCP Vertex AI)")

    # If the user has skills but we found no context-relevant gaps, note it
    if len(found_skills) > 0 and len(gaps) == 0:
        gaps.append("Advanced System Design (next-level growth area)")

    # Cap gaps at 6
    gaps = gaps[:6]

    # 3. Readiness score — strictly from what was found
    if len(found_skills) == 0:
        score = 0
    else:
        base = min(90, len(found_skills) * 8 + 15)
        penalty = len(gaps) * 3
        raw_score = max(10, base - penalty)
        score = min(100, raw_score)

    # 4. Roadmap — derived ONLY from identified gaps, no generic filler
    roadmap: List[str] = []
    for gap in gaps:
        roadmap.append(f"Learn {gap}")

    # Only add portfolio/interview steps if user actually has meaningful skills
    if len(found_skills) >= 3:
        roadmap.append("Build a portfolio project combining your detected skills")
    if len(found_skills) >= 5:
        roadmap.append("Prepare for technical interviews in your domain")

    # If no roadmap items at all (no gaps, few skills), give honest feedback
    if len(roadmap) == 0:
        if len(found_skills) == 0:
            roadmap.append("Add more technical skills and technologies to your resume")
        else:
            roadmap.append("Continue deepening your expertise in your current skill set")

    return {
        "skills":          found_skills,
        "gap_skills":      gaps,
        "readiness_score": score,
        "roadmap":         roadmap,
    }


# ─── Score breakdown (strict — only from detected skills) ─────────────────────
def score_breakdown(skills: List[str]) -> Dict[str, float]:
    """
    Breaks down the readiness score into categories.
    Each category score is based ONLY on skills that were actually detected.
    """
    s = set(skills)

    frontend_skills  = {"React", "Vue", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind"}
    backend_skills   = {"Node.js", "Python", "Java", "Go", "Django", "Flask", "FastAPI", "Spring Boot", "Express"}
    cloud_skills     = {"AWS", "Azure", "GCP"}
    devops_skills    = {"Docker", "Kubernetes", "CI/CD", "Terraform", "Ansible", "Linux", "DevOps"}
    languages        = {"Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "C++", "C#", "Kotlin", "Swift"}

    def pct(subset, cap=100):
        matched = len(s & subset)
        if len(subset) == 0:
            return 0.0
        return round(min(cap, (matched / max(1, len(subset))) * 100), 1)

    return {
        "skill_match":    pct(set(KNOWN_SKILLS[:20])),   # against top-20 common skills
        "stack_balance":  round((pct(frontend_skills) + pct(backend_skills)) / 2, 1),
        "cloud_presence": pct(cloud_skills),
        "devops_score":   pct(devops_skills),
        "language_div":   min(100.0, round(len(s & languages) * 20, 1)),
    }


# ─── Career path matching (strict — only from detected skills) ────────────────
def career_paths(skills: List[str]) -> List[Dict[str, Any]]:
    """
    Matches detected skills against role requirements.
    Only skills that were actually found in the resume are counted as matched.
    """
    skills_lower = {sk.lower() for sk in skills}
    results = []
    for role in ROLE_CATALOG:
        needed    = role["skills_needed"]
        matched   = [r for r in needed if r.lower() in skills_lower]
        missing   = [r for r in needed if r.lower() not in skills_lower]
        pct       = round((len(matched) / max(1, len(needed))) * 100)
        results.append({
            "role":           role["role"],
            "match_percent":  pct,
            "salary_range":   role["salary_range"],
            "skills_needed":  needed,
            "matched_skills": matched,
            "missing_skills": missing,
        })
    return sorted(results, key=lambda x: x["match_percent"], reverse=True)


# ─── Compare two analyses ─────────────────────────────────────────────────────
def compare_analyses(a: Dict, b: Dict) -> Dict:
    new_skills    = [s for s in b["skills"]     if s not in a["skills"]]
    resolved_gaps = [g for g in a["gap_skills"] if g not in b["gap_skills"]]
    remaining     = b["gap_skills"]
    score_delta   = b["readiness_score"] - a["readiness_score"]

    return {
        "before": {
            "skills":          a["skills"],
            "gap_skills":      a["gap_skills"],
            "readiness_score": a["readiness_score"],
        },
        "after": {
            "skills":          b["skills"],
            "gap_skills":      b["gap_skills"],
            "readiness_score": b["readiness_score"],
        },
        "delta": {
            "score_change":  score_delta,
            "new_skills":    new_skills,
            "resolved_gaps": resolved_gaps,
            "remaining_gaps": remaining,
        },
    }
