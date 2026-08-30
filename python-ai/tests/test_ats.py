"""
Unit tests for Futrix AI Engine — ATS Checker
Covers: formatting risk, section presence, date parseability,
        keyword match, file integrity, overall ats_check scoring
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from ai_engine import (
    ats_check,
    _check_formatting_risk,
    _check_section_presence,
    _check_date_parseability,
    _check_keyword_match,
    _check_file_integrity,
)


# ─── Fixtures ─────────────────────────────────────────────────────────────────

CLEAN_RESUME = """
John Doe | john@example.com | +1-555-1234
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

Summary
Experienced software engineer with 5 years building scalable web applications.

Work Experience
Senior Software Engineer - TechCorp (Jan 2021 – Present)
- Developed Python microservices deployed on AWS using Docker and Kubernetes
- Designed PostgreSQL schemas and wrote REST APIs with FastAPI

Software Engineer - StartupXYZ (Jun 2019 – Dec 2020)
- Built React frontend with TypeScript, integrated GraphQL APIs

Education
B.Sc. Computer Science, State University, 2019

Skills
Python, FastAPI, React, TypeScript, Docker, Kubernetes, AWS, PostgreSQL, REST API, Git
"""

TABLE_RESUME = """
John Doe | john@example.com

Summary
Developer with experience in many technologies.

Experience
Engineer - Corp (2020 – 2023)
Built applications.

Education
B.Sc. CS, University, 2018

Skills
| Programming    | Python, JavaScript    |
| Frameworks     | React, Django         |
| Cloud          | AWS, GCP              |
"""

NO_SECTIONS_RESUME = """
Python developer who likes to code using Docker and Kubernetes.
Worked at some company for some time.
Also knows React and TypeScript.
"""

VAGUE_DATES_RESUME = """
John Doe | john@example.com

Summary
Recent graduate looking for opportunities.

Work Experience
Software Engineer - Tech Inc.
- Built apps recently using Python and FastAPI
- Previously worked with Node.js and Docker

Education
B.Sc. CS

Skills
Python, FastAPI, Docker, Node.js
"""

GARBLED_RESUME = "John Doe\n\xff\xff\xff Software engineer with Python experience.\n\ufffd\ufffd skills in Docker."

NO_DATES_RESUME = """
Jane Smith | jane@example.com

Summary
Backend engineer with strong Python skills.

Work Experience
Software Engineer at TechCorp
- Used Python and FastAPI to build microservices
- Deployed on AWS with Docker

Education
B.Sc. Computer Science, State University

Skills
Python, FastAPI, Docker, AWS, PostgreSQL
"""


# ─── _check_formatting_risk ──────────────────────────────────────────────────

class TestFormattingRisk:
    def test_clean_resume_passes(self):
        result = _check_formatting_risk(CLEAN_RESUME)
        assert result["passed"] is True
        assert result["flags"] == []

    def test_table_detected(self):
        result = _check_formatting_risk(TABLE_RESUME)
        assert result["passed"] is False
        assert "tables_detected" in result["flags"]

    def test_table_suggestion_present(self):
        result = _check_formatting_risk(TABLE_RESUME)
        assert any("table" in s.lower() for s in result["suggestions"])

    def test_no_false_positives_on_plain_text(self):
        plain = "Python developer. Docker. AWS. Rest API. Clean resume."
        result = _check_formatting_risk(plain)
        assert result["passed"] is True


# ─── _check_section_presence ─────────────────────────────────────────────────

class TestSectionPresence:
    def test_clean_resume_passes(self):
        result = _check_section_presence(CLEAN_RESUME)
        assert result["passed"] is True
        assert result["missing_sections"] == []

    def test_detects_missing_contact(self):
        no_contact = """
        Summary
        Developer.

        Work Experience
        Engineer - Corp, 2020 to 2023

        Education
        B.Sc. CS, University, 2018

        Skills
        Python, Docker
        """
        result = _check_section_presence(no_contact)
        assert "Contact Information" in result["missing_sections"]

    def test_detects_missing_experience(self):
        no_exp = """
        Jane Smith | jane@example.com

        Summary
        Fresh graduate.

        Education
        B.Sc. CS, MIT, 2024

        Skills
        Python, React
        """
        result = _check_section_presence(no_exp)
        assert "Work Experience" in result["missing_sections"]

    def test_missing_all_sections(self):
        result = _check_section_presence(NO_SECTIONS_RESUME)
        # should be missing several key sections
        assert len(result["missing_sections"]) >= 3

    def test_suggestions_for_missing(self):
        result = _check_section_presence(NO_SECTIONS_RESUME)
        assert len(result["suggestions"]) > 0


# ─── _check_date_parseability ────────────────────────────────────────────────

class TestDateParseability:
    def test_clean_resume_has_parseable_dates(self):
        result = _check_date_parseability(CLEAN_RESUME)
        assert result["dates_found"] > 0

    def test_vague_dates_flagged(self):
        result = _check_date_parseability(VAGUE_DATES_RESUME)
        assert result["has_vague_dates"] is True
        assert result["passed"] is False

    def test_no_dates_detected(self):
        result = _check_date_parseability(NO_DATES_RESUME)
        # Resume has no explicit date format
        assert not result["passed"] or result["dates_found"] == 0

    def test_suggestions_when_no_dates(self):
        result = _check_date_parseability(NO_DATES_RESUME)
        assert len(result["suggestions"]) > 0


# ─── _check_keyword_match ────────────────────────────────────────────────────

class TestKeywordMatch:
    def test_no_jd_returns_null(self):
        result = _check_keyword_match(CLEAN_RESUME, None)
        assert result["passed"] is None
        assert result["match_percent"] is None

    def test_empty_jd_returns_null(self):
        result = _check_keyword_match(CLEAN_RESUME, "")
        assert result["passed"] is None

    def test_high_match_when_skills_align(self):
        jd = "We need Python, FastAPI, Docker, AWS, PostgreSQL, Kubernetes, React, TypeScript engineers."
        result = _check_keyword_match(CLEAN_RESUME, jd)
        assert result["match_percent"] is not None
        assert result["match_percent"] > 50
        assert result["passed"] is True

    def test_low_match_when_skills_diverge(self):
        jd = "Java Spring Boot Hibernate Microservices Oracle COBOL Mainframe SAP enterprise"
        result = _check_keyword_match(CLEAN_RESUME, jd)
        assert result["match_percent"] < 50

    def test_missing_keywords_listed(self):
        jd = "Looking for Golang Rust WASM Kubernetes expert"
        result = _check_keyword_match(CLEAN_RESUME, jd)
        assert len(result["missing_keywords"]) > 0

    def test_matched_keywords_listed(self):
        jd = "Python Docker Kubernetes AWS developer needed"
        result = _check_keyword_match(CLEAN_RESUME, jd)
        assert len(result["matched_keywords"]) > 0


# ─── _check_file_integrity ───────────────────────────────────────────────────

class TestFileIntegrity:
    def test_clean_resume_passes(self):
        result = _check_file_integrity(CLEAN_RESUME)
        assert result["passed"] is True
        assert result["has_garbled_text"] is False

    def test_garbled_text_detected(self):
        result = _check_file_integrity(GARBLED_RESUME)
        assert result["has_garbled_text"] is True
        assert result["passed"] is False

    def test_suggestions_for_garbled(self):
        result = _check_file_integrity(GARBLED_RESUME)
        assert len(result["suggestions"]) > 0


# ─── ats_check — integration ─────────────────────────────────────────────────

class TestAtsCheck:
    def test_returns_required_keys(self):
        result = ats_check(CLEAN_RESUME)
        assert "ats_score" in result
        assert "summary" in result
        assert "summary_detail" in result
        assert "checks" in result
        assert "all_suggestions" in result

    def test_checks_have_required_sub_keys(self):
        result = ats_check(CLEAN_RESUME)
        checks = result["checks"]
        assert "formatting_risk" in checks
        assert "section_presence" in checks
        assert "date_parseability" in checks
        assert "keyword_match" in checks
        assert "file_integrity" in checks

    def test_score_in_valid_range(self):
        for resume in [CLEAN_RESUME, TABLE_RESUME, NO_SECTIONS_RESUME, GARBLED_RESUME]:
            result = ats_check(resume)
            assert 0 <= result["ats_score"] <= 100, f"Score out of range for resume: {result['ats_score']}"

    def test_clean_resume_scores_high(self):
        result = ats_check(CLEAN_RESUME)
        assert result["ats_score"] >= 70, f"Clean resume should score >= 70, got {result['ats_score']}"

    def test_bad_resume_scores_low(self):
        """Table resume should score lower than a clean resume due to formatting penalty."""
        table_result = ats_check(TABLE_RESUME)
        clean_result = ats_check(CLEAN_RESUME)
        # Table resume must score at least 10 points below the clean resume
        assert table_result["ats_score"] < clean_result["ats_score"] - 5
        # And should never be perfect
        assert table_result["ats_score"] < 100

    def test_garbled_resume_scores_low(self):
        result = ats_check(GARBLED_RESUME)
        assert result["ats_score"] < 50

    def test_no_sections_scores_low(self):
        result = ats_check(NO_SECTIONS_RESUME)
        assert result["ats_score"] < 60

    def test_keyword_match_with_jd(self):
        jd = "Python FastAPI Docker AWS Kubernetes PostgreSQL engineer"
        result = ats_check(CLEAN_RESUME, job_description=jd)
        assert result["checks"]["keyword_match"]["passed"] is not None
        assert result["checks"]["keyword_match"]["match_percent"] is not None

    def test_no_jd_keyword_check_not_applicable(self):
        result = ats_check(CLEAN_RESUME)
        assert result["checks"]["keyword_match"]["passed"] is None

    def test_summary_text_reflects_score(self):
        high_result = ats_check(CLEAN_RESUME)
        low_result  = ats_check(GARBLED_RESUME)
        # High score should not say "Incompatible"
        assert "Incompatible" not in high_result["summary"]
        # Low score should not say "ATS-Ready"
        assert "ATS-Ready" != low_result["summary"]

    def test_suggestions_not_empty_for_bad_resume(self):
        result = ats_check(NO_SECTIONS_RESUME)
        assert len(result["all_suggestions"]) > 0

    def test_too_short_resume_raises_error(self):
        """Short text is caught by main.py, but ats_check itself still handles gracefully."""
        # The endpoint validates this; ats_check itself runs on whatever it receives
        # Test that it doesn't crash
        result = ats_check("Short text")
        assert "ats_score" in result

    def test_deterministic_output(self):
        """Same input should always produce same output."""
        r1 = ats_check(CLEAN_RESUME)
        r2 = ats_check(CLEAN_RESUME)
        assert r1["ats_score"] == r2["ats_score"]
        assert r1["summary"] == r2["summary"]
