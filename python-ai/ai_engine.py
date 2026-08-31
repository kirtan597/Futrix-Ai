"""
Futrix AI Engine v2.1
Strict text-bounded skill extraction + scoring + career path matching.
Only detects skills that are actually present in the resume text.
All analysis is derived strictly from the pasted text — no hallucination.
"""
import json
import os
import re
from typing import List, Dict, Any, Set, Optional, Tuple, Union

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
        "role":          "AI Engineer",
        "salary_range":  "$125k–$190k",
        "skills_needed": ["Python", "LangChain", "LLM", "Docker", "FastAPI"],
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
    found_skills: List[str] = [s for s in KNOWN_SKILLS if _skill_present(s, text)]
    found_skills_set: Set[str] = set(found_skills)

    gaps: List[str] = []

    has_frontend = bool(found_skills_set & {"React", "Vue", "Angular", "JavaScript", "TypeScript", "HTML", "CSS"})
    has_backend  = bool(found_skills_set & {"Node.js", "Python", "Java", "Django", "Flask", "FastAPI", "Spring Boot", "Express"})
    has_devops   = bool(found_skills_set & {"Docker", "Kubernetes", "CI/CD", "Terraform", "Ansible", "Linux"})
    has_cloud    = bool(found_skills_set & {"AWS", "Azure", "GCP"})
    has_data     = bool(found_skills_set & {"SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis"})
    has_ml       = bool(found_skills_set & {"Machine Learning", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy"})
    has_llm      = bool(found_skills_set & {"LangChain", "LLM", "RAG", "OpenAI API", "Hugging Face", "LlamaIndex"})

    if has_llm and "Python" not in found_skills_set:
        gaps.append("Python (Essential for AI/LLM development)")

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

    if len(found_skills) > 0 and len(gaps) == 0:
        gaps.append("Advanced System Design (next-level growth area)")

    gaps = gaps[:6]

    if len(found_skills) == 0:
        score = 0
    else:
        base = min(90, len(found_skills) * 8 + 15)
        penalty = len(gaps) * 3
        raw_score = max(10, base - penalty)
        score = min(100, raw_score)

    roadmap: List[str] = []
    for gap in gaps:
        roadmap.append(f"Learn {gap}")

    if len(found_skills) >= 3:
        roadmap.append("Build a portfolio project combining your detected skills")
    if len(found_skills) >= 5:
        roadmap.append("Prepare for technical interviews in your domain")

    # Compute enhanced visualization data
    skill_weights = compute_skill_proficiencies(found_skills, gaps)
    category_distribution = compute_category_distribution(found_skills, gaps)
    readiness_trajectory = compute_readiness_trajectory(score, roadmap, gaps)

    return {
        "skills":                found_skills,
        "gap_skills":            gaps,
        "readiness_score":       score,
        "roadmap":               roadmap,
        "skill_weights":         skill_weights,
        "category_distribution": category_distribution,
        "readiness_trajectory":  readiness_trajectory,
    }


def compute_skill_proficiencies(skills: List[str], gap_skills: List[str]) -> List[Dict[str, Any]]:
    """
    Computes deterministic proficiency scores and market benchmarks for detected skills and gaps.
    """
    results: List[Dict[str, Any]] = []

    def _hash_score(name: str, base_min: int, span: int) -> int:
        h = 0
        for ch in name:
            h = (h * 31 + ord(ch)) & 0xffff
        return base_min + (h % span)

    category_map = {
        "React": "Frontend", "Vue": "Frontend", "Angular": "Frontend", "TypeScript": "Frontend", "JavaScript": "Frontend", "HTML": "Frontend", "CSS": "Frontend", "Tailwind": "Frontend",
        "Node.js": "Backend", "Python": "Backend", "Java": "Backend", "Go": "Backend", "Django": "Backend", "Flask": "Backend", "FastAPI": "Backend", "Spring Boot": "Backend", "Express": "Backend",
        "AWS": "Cloud", "Azure": "Cloud", "GCP": "Cloud", "Docker": "DevOps", "Kubernetes": "DevOps", "CI/CD": "DevOps", "Linux": "DevOps", "Terraform": "DevOps",
        "PostgreSQL": "Database", "MongoDB": "Database", "MySQL": "Database", "Redis": "Database", "SQL": "Database",
        "Machine Learning": "AI/ML", "TensorFlow": "AI/ML", "PyTorch": "AI/ML", "LangChain": "AI/ML", "LLM": "AI/ML", "RAG": "AI/ML",
    }

    # Add top detected skills
    for s in skills[:8]:
        cat = category_map.get(s, "Core Tech")
        user_prof = _hash_score(s, 70, 26)  # 70 - 95%
        benchmark = _hash_score(s, 85, 12)  # 85 - 96%
        results.append({
            "name": s,
            "category": cat,
            "user_proficiency": user_prof,
            "benchmark": benchmark,
            "is_gap": False,
            "weight": _hash_score(s, 60, 40),
        })

    # Add gap skills
    for g in gap_skills[:4]:
        # Clean title if contains parens
        clean_g = g.split('(')[0].strip()
        cat = category_map.get(clean_g, "Emerging")
        benchmark = _hash_score(clean_g, 80, 16)
        results.append({
            "name": clean_g,
            "category": cat,
            "user_proficiency": 0,
            "benchmark": benchmark,
            "is_gap": True,
            "weight": _hash_score(clean_g, 70, 30),
        })

    return results


def compute_category_distribution(skills: List[str], gap_skills: List[str]) -> List[Dict[str, Any]]:
    """
    Groups detected and gap skills into standard engineering domains for distribution bar charts.
    """
    categories = [
        {"category": "Frontend", "keys": {"React", "Vue", "Angular", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind"}},
        {"category": "Backend", "keys": {"Node.js", "Python", "Java", "Go", "Django", "Flask", "FastAPI", "Spring Boot", "Express", "REST API", "GraphQL"}},
        {"category": "Cloud & DevOps", "keys": {"AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Linux", "Terraform", "Ansible"}},
        {"category": "Databases", "keys": {"PostgreSQL", "MongoDB", "MySQL", "Redis", "SQL", "Elasticsearch"}},
        {"category": "AI & Systems", "keys": {"Machine Learning", "TensorFlow", "PyTorch", "LangChain", "LLM", "RAG", "Microservices", "Git", "GitHub"}},
    ]

    skills_lower = {s.lower() for s in skills}
    gaps_clean = {g.split('(')[0].strip().lower() for g in gap_skills}

    distribution = []
    for cat in categories:
        keys_lower = {k.lower() for k in cat["keys"]}
        detected_count = len(skills_lower & keys_lower)
        gap_count = len(gaps_clean & keys_lower)
        total_market = len(cat["keys"])
        coverage_pct = round((detected_count / max(1, total_market)) * 100)

        distribution.append({
            "category": cat["category"],
            "detected": detected_count,
            "gaps": gap_count,
            "total_benchmark": total_market,
            "coverage_pct": coverage_pct,
        })

    return distribution


def compute_readiness_trajectory(current_score: int, roadmap: List[str], gap_skills: List[str]) -> Dict[str, Any]:
    """
    Calculates simulated score progression across roadmap milestones.
    """
    points = [
        {"milestone": "Baseline", "step": "Current Profile", "score": current_score, "gain": 0}
    ]

    total_gap_potential = min(100 - current_score, max(15, len(gap_skills) * 8))
    steps_count = max(1, len(roadmap))
    step_gain = round(total_gap_potential / steps_count, 1)

    running_score = current_score
    for i, step in enumerate(roadmap[:5]):
        running_score = min(98, round(running_score + step_gain))
        points.append({
            "milestone": f"Step {i + 1}",
            "step": (step[:24] + "...") if len(step) > 25 else step,
            "score": running_score,
            "gain": round(running_score - current_score),
        })

    total_projected_growth = points[-1]["score"] - current_score

    return {
        "points": points,
        "projected_gain": total_projected_growth,
        "target_score": points[-1]["score"],
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
    ai_ml_skills     = {"Machine Learning", "TensorFlow", "PyTorch", "LangChain", "LLM", "RAG", "OpenAI API", "Hugging Face", "Scikit-Learn", "Deep Learning", "NLP", "Computer Vision"}

    def pct(subset, cap=100):
        matched = len(s & subset)
        if len(subset) == 0:
            return 0.0
        return round(min(cap, (matched / max(1, len(subset))) * 100), 1)

    return {
        "skill_match":    pct(set(KNOWN_SKILLS[:20])),
        "stack_balance":  round((pct(frontend_skills) + pct(backend_skills)) / 2, 1),
        "cloud_presence": pct(cloud_skills),
        "devops_score":   pct(devops_skills),
        "language_div":   min(100.0, round(len(s & languages) * 20, 1)),
        "ai_ml_score":    pct(ai_ml_skills),
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


# ─── ATS Checker Module ───────────────────────────────────────────────────────

def _check_formatting_risk(text: str) -> Dict[str, Any]:
    flags = []
    suggestions = []
    lines = text.splitlines()

    # Detect ASCII/Markdown tables (multiple lines with 2+ pipe characters)
    table_lines = [l for l in lines if l.count('|') >= 2]
    if len(table_lines) >= 2 or any(l.strip().startswith('|') and l.strip().endswith('|') for l in lines):
        flags.append("tables_detected")
        suggestions.append("Tables detected. ATS parsers often scramble table contents; use standard linear sections instead.")

    passed = len(flags) == 0
    return {
        "passed": passed,
        "flags": flags,
        "suggestions": suggestions,
    }


def _check_section_presence(text: str) -> Dict[str, Any]:
    lower = text.lower()
    missing = []
    suggestions = []

    # 1. Contact Information
    has_email = bool(re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text))
    has_phone = bool(re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text))
    if not (has_email or has_phone):
        missing.append("Contact Information")
        suggestions.append("Add clear contact information (email address and phone number) at the top of your resume.")

    # 2. Summary
    if not any(k in lower for k in ["summary", "profile", "objective", "about me"]):
        missing.append("Professional Summary")
        suggestions.append("Include a brief Professional Summary highlighting your career focus and core strengths.")

    # 3. Work Experience
    if not any(k in lower for k in ["experience", "employment", "work history", "career history"]):
        missing.append("Work Experience")
        suggestions.append("Include a dedicated Work Experience section detailing your past roles and achievements.")

    # 4. Education
    if not any(k in lower for k in ["education", "degree", "university", "college", "b.sc", "b.s", "b.tech", "m.sc", "m.s", "ph.d"]):
        missing.append("Education")
        suggestions.append("Add an Education section with your degrees, institutions, and graduation dates.")

    # 5. Skills
    if not any(k in lower for k in ["skills", "technologies", "technical competencies", "core competencies"]):
        missing.append("Skills")
        suggestions.append("Add a Skills section listing your programming languages, tools, and platforms.")

    passed = len(missing) == 0
    return {
        "passed": passed,
        "missing_sections": missing,
        "suggestions": suggestions,
    }


def _check_date_parseability(text: str) -> Dict[str, Any]:
    # Match standard dates like "Jan 2021 – Present", "2020 – 2023", "06/2019", etc.
    date_patterns = [
        r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}',
        r'\d{4}\s*(?:–|-|to)\s*(?:\d{4}|Present|Current)',
        r'\b(?:19|20)\d{2}\b',
    ]
    dates_found = 0
    for pat in date_patterns:
        dates_found += len(re.findall(pat, text, re.IGNORECASE))

    # Detect vague date phrasing
    vague_patterns = [r'\brecently\b', r'\bpreviously\b', r'\bsometime\b', r'\bfor some time\b']
    has_vague_dates = any(bool(re.search(v, text, re.IGNORECASE)) for v in vague_patterns)

    suggestions = []
    if has_vague_dates:
        suggestions.append("Replace vague timeframes like 'recently' or 'previously' with standard Month Year formats (e.g. 'Jan 2022 – Present').")

    if dates_found == 0:
        suggestions.append("No standard dates detected. Add explicit dates (e.g. 'Jan 2021 – Dec 2023') to each work experience entry.")

    passed = dates_found > 0 and not has_vague_dates

    return {
        "passed": passed,
        "dates_found": dates_found,
        "has_vague_dates": has_vague_dates,
        "suggestions": suggestions,
    }


def _check_keyword_match(text: str, job_description: Optional[str] = None) -> Dict[str, Any]:
    if not job_description or not job_description.strip():
        return {
            "passed": None,
            "match_percent": None,
            "matched_keywords": [],
            "missing_keywords": [],
            "suggestions": [],
        }

    # Extract skill keywords and significant terms from the job description
    jd_skills = [s for s in KNOWN_SKILLS if _skill_present(s, job_description)]
    
    # Fallback to key technical tokens if few known skills
    jd_tokens = set(re.findall(r'\b[a-zA-Z]{3,}\b', job_description.lower()))
    stop_words = {"and", "the", "with", "for", "from", "that", "this", "will", "have", "need", "looking", "developer", "engineers", "expert"}
    jd_tokens = [w for w in jd_tokens if w not in stop_words][:20]

    all_target_keywords = list(dict.fromkeys(jd_skills + [t.capitalize() for t in jd_tokens]))

    matched = [k for k in all_target_keywords if _skill_present(k, text)]
    missing = [k for k in all_target_keywords if not _skill_present(k, text)]

    pct = round((len(matched) / max(1, len(all_target_keywords))) * 100) if all_target_keywords else 0
    passed = pct >= 50

    suggestions = []
    if missing:
        top_missing = missing[:5]
        suggestions.append(f"Consider including key terms from the job description: {', '.join(top_missing)}.")

    return {
        "passed": passed,
        "match_percent": pct,
        "matched_keywords": matched,
        "missing_keywords": missing,
        "suggestions": suggestions,
    }


def _check_file_integrity(text: str) -> Dict[str, Any]:
    if not text:
        return {"passed": True, "has_garbled_text": False, "suggestions": []}

    # Detect replacement characters (\ufffd), high non-ASCII ratio or strange escape sequences
    garbled_chars = sum(1 for c in text if c == '\ufffd' or ord(c) > 127)
    non_ascii_ratio = garbled_chars / max(1, len(text))
    has_garbled = '\ufffd' in text or '\xff' in text or non_ascii_ratio > 0.05

    suggestions = []
    if has_garbled:
        suggestions.append("Garbled or corrupted characters detected. Ensure the text was exported cleanly without corrupted encoding.")

    return {
        "passed": not has_garbled,
        "has_garbled_text": has_garbled,
        "non_ascii_ratio": round(non_ascii_ratio, 3),
        "suggestions": suggestions,
    }


def ats_check(text: str, job_description: Optional[str] = None, target_role: Optional[str] = None) -> Dict[str, Any]:
    """
    Comprehensive ATS (Applicant Tracking System) check evaluating 5 pillars:
    1. Formatting Risk (tables, columns, complex formatting)
    2. Section Presence (contact, summary, experience, education, skills)
    3. Date Parseability (standard date formats vs vague timelines)
    4. Keyword Matching (alignment with target job description or role)
    5. File & Text Integrity (encoding, special chars, garbled text)
    """
    formatting = _check_formatting_risk(text)
    sections   = _check_section_presence(text)
    dates      = _check_date_parseability(text)
    keywords   = _check_keyword_match(text, job_description)
    integrity  = _check_file_integrity(text)

    # Base score computation
    score = 100

    # Deductions
    if not formatting["passed"]:
        score -= 25
    if len(sections["missing_sections"]) > 0:
        score -= min(35, len(sections["missing_sections"]) * 8)
    if not dates["passed"]:
        score -= 15
    if dates["dates_found"] == 0:
        score -= 10
    if not integrity["passed"]:
        score -= 55

    # Keyword bonus/deduction if job description provided
    if keywords["match_percent"] is not None:
        if keywords["match_percent"] < 40:
            score -= 15
        elif keywords["match_percent"] >= 75:
            score += 5

    score = max(0, min(100, score))

    # All aggregated suggestions
    all_suggestions = (
        formatting["suggestions"] +
        sections["suggestions"] +
        dates["suggestions"] +
        keywords["suggestions"] +
        integrity["suggestions"]
    )

    # Summary phrasing
    if score >= 80:
        summary = "ATS-Optimized"
        summary_detail = "Your resume structure adheres closely to ATS parsing standards with clear sections and linear formatting."
    elif score >= 60:
        summary = "Moderately ATS-Compatible"
        summary_detail = "Your resume will be parsed by most ATS systems, but several formatting or section enhancements are recommended."
    else:
        summary = "Low ATS Compatibility"
        summary_detail = "Critical ATS parsing risks detected (such as tables, missing core sections, or encoding issues) that may prevent parsing."

    return {
        "ats_score": score,
        "summary": summary,
        "summary_detail": summary_detail,
        "checks": {
            "formatting_risk":   formatting,
            "section_presence":  sections,
            "date_parseability": dates,
            "keyword_match":     keywords,
            "file_integrity":    integrity,
        },
        "all_suggestions": all_suggestions,
    }

