"""
CareerTwin AI Engine v2.0
Pure Python skill extraction + scoring + career path matching.
"""
import json
import os
from typing import List, Dict, Any

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


# ─── Core analysis ────────────────────────────────────────────────────────────
def analyze_resume(text: str) -> Dict[str, Any]:
    text_lower = text.lower()

    # 1. Skill extraction
    found_skills: List[str] = [s for s in KNOWN_SKILLS if s.lower() in text_lower]

    # 2. Gap analysis — rule-based with expanded rules
    skill_set = set(found_skills)
    gaps: List[str] = []

    gap_rules = [
        (lambda s: "React" in s and "Node.js" not in s and "Django" not in s and "Java" not in s,
         "Node.js"),
        (lambda s: "Python" in s and "Machine Learning" not in s and "Django" not in s and "FastAPI" not in s,
         "Django or FastAPI"),
        (lambda s: "Docker" not in s,
         "Docker"),
        (lambda s: "Kubernetes" not in s and "Docker" in s,
         "Kubernetes"),
        (lambda s: "Git" not in s and "GitHub" not in s,
         "Git"),
        (lambda s: "AWS" not in s and "Azure" not in s and "GCP" not in s,
         "Cloud Platform (AWS/Azure/GCP)"),
        (lambda s: "CI/CD" not in s and "GitHub" not in s,
         "CI/CD"),
        (lambda s: "TypeScript" not in s and "JavaScript" in s,
         "TypeScript"),
        (lambda s: "PostgreSQL" not in s and "MySQL" not in s and "SQL" not in s and "MongoDB" not in s,
         "SQL Database"),
        (lambda s: "Redis" not in s and ("Node.js" in s or "Python" in s),
         "Redis (Caching)"),
    ]

    for rule, gap_label in gap_rules:
        if rule(skill_set):
            gaps.append(gap_label)
        if len(gaps) >= 6:
            break

    if not gaps:
        gaps.append("Advanced System Design")

    # 3. Readiness score
    base = min(90, len(found_skills) * 8 + 15)
    penalty = len(gaps) * 3
    raw_score = max(10, base - penalty)
    score = min(100, raw_score)

    # 4. Roadmap
    roadmap = [f"Learn {g}" for g in gaps[:5]]
    if len(roadmap) < 3:
        roadmap.append("Build a production-grade full-stack project")
    roadmap.append("Contribute to Open Source on GitHub")
    roadmap.append("Study System Design patterns (microservices, caching, load balancing)")
    roadmap.append("Prepare for behavioural + technical interviews")

    return {
        "skills":          found_skills,
        "gap_skills":      gaps,
        "readiness_score": score,
        "roadmap":         roadmap,
    }


# ─── Score breakdown ──────────────────────────────────────────────────────────
def score_breakdown(skills: List[str]) -> Dict[str, float]:
    s = set(skills)

    frontend_skills  = {"React", "Vue", "Angular", "TypeScript", "JavaScript"}
    backend_skills   = {"Node.js", "Python", "Java", "Go", "Django", "Flask", "FastAPI", "Spring Boot"}
    cloud_skills     = {"AWS", "Azure", "GCP"}
    devops_skills    = {"Docker", "Kubernetes", "CI/CD", "Terraform", "Ansible", "Linux"}
    languages        = {"Python", "JavaScript", "TypeScript", "Java", "Go", "Rust", "C++", "C#"}

    def pct(subset, cap=100):
        matched = len(s & subset)
        return round(min(cap, (matched / max(1, len(subset))) * 100), 1)

    return {
        "skill_match":    pct(set(KNOWN_SKILLS[:20])),   # against top-20 common skills
        "stack_balance":  round((pct(frontend_skills) + pct(backend_skills)) / 2, 1),
        "cloud_presence": pct(cloud_skills),
        "devops_score":   pct(devops_skills),
        "language_div":   min(100.0, round(len(s & languages) * 20, 1)),
    }


# ─── Career path matching ─────────────────────────────────────────────────────
def career_paths(skills: List[str]) -> List[Dict[str, Any]]:
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
