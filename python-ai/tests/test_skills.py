"""
Unit tests for Futrix AI Engine — Skills Analyzer
Covers: skill detection, gap logic, score_breakdown, career_paths
"""
import sys
import os

# Ensure the parent directory is in path so we can import ai_engine
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from ai_engine import (
    _skill_present,
    analyze_resume,
    score_breakdown,
    career_paths,
    KNOWN_SKILLS,
)


# ─── _skill_present ───────────────────────────────────────────────────────────

class TestSkillPresent:
    """Tests for the core skill-matching function."""

    def test_simple_substring_match(self):
        assert _skill_present("Python", "I use Python and Django") is True

    def test_case_insensitive(self):
        assert _skill_present("React", "Built apps using REACT") is True
        assert _skill_present("TypeScript", "typescript is used") is True

    def test_absent_skill(self):
        assert _skill_present("Kubernetes", "Docker and AWS were used") is False

    # Boundary skills — should NOT match as part of other words
    def test_go_not_in_google(self):
        assert _skill_present("Go", "I use Google Cloud and GitHub") is False

    def test_go_standalone(self):
        assert _skill_present("Go", "Developed microservices in Go") is True
        assert _skill_present("Go", "Go is my primary language") is True

    def test_sql_not_in_mysql(self):
        # "SQL" alone, boundary-checked
        # Should match "SQL" but ideally not if it's a substring of "MySQL"
        # Current logic: boundary match won't match "MySQL" since SQL is inside
        assert _skill_present("SQL", "I know MySQL and PostgreSQL") is False
        assert _skill_present("SQL", "Proficient in SQL and PL/SQL") is True

    def test_css_not_in_access(self):
        assert _skill_present("CSS", "database access") is False
        assert _skill_present("CSS", "Styled with CSS") is True

    def test_ai_not_in_email(self):
        assert _skill_present("AI", "contact via email@domain.com") is False
        assert _skill_present("AI", "experienced in AI and ML") is True

    def test_r_not_in_react(self):
        assert _skill_present("R", "Used React and Ruby") is False
        # "R" should match as a language token
        assert _skill_present("R", "Statistical analysis using R") is True

    def test_cpp(self):
        assert _skill_present("C++", "Expert in C++ and C#") is True
        assert _skill_present("C++", "No relevant skills") is False

    def test_csharp(self):
        assert _skill_present("C#", ".NET developer using C# and ASP.NET") is True

    # New 2026 skills
    def test_langchain_detected(self):
        assert _skill_present("LangChain", "Built RAG pipeline with LangChain and OpenAI API") is True

    def test_argocd_detected(self):
        assert _skill_present("ArgoCD", "Deployed with ArgoCD for GitOps") is True

    def test_remix_detected(self):
        assert _skill_present("Remix", "Full-stack app using Remix and React") is True

    def test_clickhouse_detected(self):
        assert _skill_present("ClickHouse", "Stored analytics data in ClickHouse") is True

    def test_supabase_detected(self):
        assert _skill_present("Supabase", "Backend with Supabase and PostgreSQL") is True

    def test_ollama_detected(self):
        assert _skill_present("Ollama", "Ran local LLMs with Ollama") is True

    def test_opentofu_detected(self):
        assert _skill_present("OpenTofu", "Infrastructure managed with OpenTofu") is True


# ─── analyze_resume ───────────────────────────────────────────────────────────

FRONTEND_RESUME = """
John Doe | john@example.com | +1-555-1234 | LinkedIn: linkedin.com/in/johndoe

Summary
Frontend developer with 4 years building React applications with TypeScript and CSS.

Work Experience
Senior Frontend Engineer - TechCorp (Jan 2022 – Present)
- Built dashboards using React, TypeScript, and Tailwind CSS
- Integrated REST APIs with Axios and managed state with Zustand

Education
B.Sc. Computer Science, MIT, 2020

Skills
React, TypeScript, JavaScript, CSS, HTML, Tailwind, REST API, Git, GitHub, Vite
"""

BACKEND_RESUME = """
Jane Smith | jane@example.com

Summary
Backend engineer specialising in Python and Node.js microservices.

Experience
Backend Engineer - DataSystems (Mar 2021 – Present)
- Developed FastAPI services deployed with Docker on AWS ECS
- PostgreSQL for data persistence, Redis for caching

Education
M.Sc. Software Engineering, Stanford, 2021

Skills
Python, FastAPI, Node.js, Docker, AWS, PostgreSQL, Redis, REST API, CI/CD, Git
"""

AI_RESUME = """
Alex Lee | alex@example.com

Experience
AI Engineer - StartupAI (2023 – Present)
- Built RAG pipelines using LangChain and Hugging Face Transformers
- Fine-tuning LLMs with PyTorch and deployed via FastAPI on Docker

Skills
Python, LangChain, LLM, RAG, Hugging Face, PyTorch, FastAPI, Docker, OpenAI API
"""

EMPTY_RESUME = "I am a software developer with good communication skills."


class TestAnalyzeResume:
    def test_frontend_skills_detected(self):
        result = analyze_resume(FRONTEND_RESUME)
        assert "React" in result["skills"]
        assert "TypeScript" in result["skills"]
        assert "JavaScript" in result["skills"]

    def test_backend_skills_detected(self):
        result = analyze_resume(BACKEND_RESUME)
        assert "Python" in result["skills"]
        assert "FastAPI" in result["skills"]
        assert "Docker" in result["skills"]
        assert "PostgreSQL" in result["skills"]

    def test_ai_skills_detected(self):
        result = analyze_resume(AI_RESUME)
        assert "LangChain" in result["skills"]
        assert "LLM" in result["skills"]
        assert "RAG" in result["skills"]
        assert "Hugging Face" in result["skills"]

    def test_score_positive_for_skilled_resume(self):
        result = analyze_resume(FRONTEND_RESUME)
        assert result["readiness_score"] > 30

    def test_score_zero_for_empty_resume(self):
        result = analyze_resume(EMPTY_RESUME)
        assert result["readiness_score"] == 0

    def test_gaps_are_domain_contextual(self):
        """Frontend dev should NOT get ML gaps."""
        result = analyze_resume(FRONTEND_RESUME)
        gap_text = " ".join(result["gap_skills"])
        assert "TensorFlow" not in gap_text
        assert "PyTorch" not in gap_text

    def test_frontend_gaps_suggest_cloud(self):
        result = analyze_resume(FRONTEND_RESUME)
        gap_text = " ".join(result["gap_skills"])
        assert "Cloud" in gap_text

    def test_ai_tooling_gaps_suggest_python(self):
        """If LLM skills detected but no Python, Python should be suggested."""
        llm_no_python = """
        Experience
        AI Engineer 2023 – Present
        Built chatbots with LangChain and RAG pipelines using LLM and OpenAI API.
        Skills: LangChain, LLM, RAG, OpenAI API
        """
        result = analyze_resume(llm_no_python)
        gap_text = " ".join(result["gap_skills"])
        assert "Python" in gap_text

    def test_roadmap_derived_from_gaps(self):
        result = analyze_resume(BACKEND_RESUME)
        for gap in result["gap_skills"]:
            assert any(gap in step for step in result["roadmap"])

    def test_gap_cap_at_six(self):
        result = analyze_resume(EMPTY_RESUME)
        assert len(result["gap_skills"]) <= 6

    def test_skills_are_subset_of_known_skills(self):
        result = analyze_resume(FRONTEND_RESUME)
        for skill in result["skills"]:
            assert skill in KNOWN_SKILLS


# ─── score_breakdown ──────────────────────────────────────────────────────────

class TestScoreBreakdown:
    def test_returns_all_keys(self):
        result = score_breakdown(["React", "Python", "Docker", "AWS"])
        assert "skill_match" in result
        assert "stack_balance" in result
        assert "cloud_presence" in result
        assert "devops_score" in result
        assert "language_div" in result
        assert "ai_ml_score" in result

    def test_cloud_presence_full_with_all_clouds(self):
        result = score_breakdown(["AWS", "Azure", "GCP"])
        assert result["cloud_presence"] == 100.0

    def test_ai_ml_score_with_llm_skills(self):
        result = score_breakdown(["Python", "LangChain", "LLM", "RAG", "Hugging Face"])
        assert result["ai_ml_score"] > 0

    def test_empty_skills_all_zero(self):
        result = score_breakdown([])
        assert all(v == 0.0 for v in result.values())

    def test_scores_in_range(self):
        result = score_breakdown(["React", "TypeScript", "AWS", "Docker", "TensorFlow"])
        for v in result.values():
            assert 0.0 <= v <= 100.0


# ─── career_paths ─────────────────────────────────────────────────────────────

class TestCareerPaths:
    def test_returns_sorted_by_match(self):
        paths = career_paths(["Python", "Machine Learning", "TensorFlow", "Docker"])
        percents = [p["match_percent"] for p in paths]
        assert percents == sorted(percents, reverse=True)

    def test_all_roles_returned(self):
        paths = career_paths(["React"])
        assert len(paths) >= 7  # we have at least 7 roles now

    def test_frontend_engineer_match(self):
        paths = career_paths(["React", "TypeScript", "JavaScript", "CSS", "HTML"])
        fe = next(p for p in paths if p["role"] == "Frontend Engineer")
        assert fe["match_percent"] == 100

    def test_ai_engineer_role_exists(self):
        paths = career_paths(["Python", "LangChain", "LLM", "Docker", "FastAPI"])
        roles = [p["role"] for p in paths]
        assert "AI Engineer" in roles

    def test_missing_skills_populated(self):
        paths = career_paths(["React"])
        fe = next(p for p in paths if p["role"] == "Frontend Engineer")
        assert len(fe["missing_skills"]) > 0
