<div align="center">

<img src="client/public/logo.svg" alt="Futrix AI Logo" width="72" height="72" />

# Futrix AI

**AI-Powered Career Intelligence Platform**

Analyze your resume, surface skill gaps, map your career path — all in a premium monochrome SaaS interface.

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47a248?style=flat-square&logo=mongodb)](https://mongodb.com)

</div>

---

## Overview

Futrix AI is a full-stack career intelligence platform that parses your resume, extracts skills using an NLP AI engine, scores your readiness for target roles, identifies skill gaps, and generates a personalized roadmap — presented through a premium dark-mode SaaS dashboard.

---

## Architecture

```
futrix-ai/
├── client/          # React 18 + TypeScript + Vite frontend
├── node-api/        # Node.js + Express REST API + Auth
├── python-ai/       # Python FastAPI AI engine (NLP analysis)
├── java-gateway/    # Java Spring Boot API gateway (optional)
├── run-dev.bat      # One-command dev launcher (Windows)
└── docker-compose.yml
```

### Service Map

| Service | Tech | Port | Responsibility |
|---|---|---|---|
| **Frontend** | React 18 + Vite + MUI | `5173` | UI, routing, state |
| **Node API** | Node.js + Express + JWT | `5000` | Auth, user data, MongoDB |
| **Python AI** | FastAPI + uvicorn | `8000` | Resume parsing, scoring, gap analysis |
| **Java Gateway** | Spring Boot | `8080` | Optional API gateway |
| **Database** | MongoDB | `27017` | Persistent user data |

---

## Features

### AI Analysis Engine
- **Resume Parsing** — Extracts skills, experience, and role signals from PDF/text uploads
- **Readiness Scoring** — 0–100 score with grade classification (Excellent / Good / Fair / Developing)
- **Skill Gap Detection** — Identifies missing skills ranked by career impact
- **Career Path Mapping** — AI-generated role matches with salary ranges and match percentages
- **Personalized Roadmap** — Step-by-step learning plan with course recommendations

### Dashboard & Analytics
- **Score Ring** — Animated SVG circular progress with glow effect
- **Skill Radar** — Recharts radar chart comparing detected vs gap skills
- **Donut Chart** — Skills have vs gap visual breakdown
- **Area Chart** — Score progression over time with reference line
- **Priority Matrix** — 2×2 Impact vs Effort quadrant scatter for skill gaps
- **Gap Severity Index** — Animated progress bars ranked by career impact

### UI/UX
- Premium monochrome SaaS aesthetic (`#0a0a0a` base, white typography)
- Fully mobile-responsive: bottom nav bar + slide-out drawer on mobile
- 44px minimum touch targets, iOS safe-area insets, PWA meta tags
- Smooth entrance animations (`fadeUp`, `opacity` transitions)
- Glass card components with subtle border glow on hover

### Auth
- Google OAuth 2.0 via `@react-oauth/google`
- JWT access tokens stored in `localStorage` under `accessToken`
- Protected routes with automatic redirect
- Rate limiting on auth endpoints

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Login | Spiral canvas animation + Google OAuth sign-in |
| `/dashboard` | Dashboard | Score ring, radar, donut, area chart + analysis summary |
| `/upload` | Upload Resume | Drag-and-drop zone + analyzing overlay |
| `/result` | AI Analysis | Full parsed result from Python AI engine |
| `/skills-gap` | Skills Gap | Priority matrix, severity bars, skill distribution chart |
| `/career-path` | Career Path | SVG flowchart roadmap + role match cards with rings |
| `/history` | History | Score trajectory chart + visual timeline of past analyses |
| `/profile` | Profile | User info and session management |

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (running locally)
- Google OAuth Client ID

### 1. Clone & Install

```bash
git clone https://github.com/kirtan597/CareerTwin-AI.git
cd career-twin-ai

# Install frontend deps
cd client && npm install && cd ..

# Install Node API deps
cd node-api && npm install && cd ..

# Install Python AI deps
cd python-ai && pip install -r requirements.txt && cd ..
```

### 2. Environment Variables

**`node-api/.env`**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/futrixai
JWT_SECRET=your_64_char_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
```

**`client/.env`**
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:5000
```

### 3. Start Development (Windows)

```bat
.\run-dev.bat
```

This starts all 4 services in order: MongoDB → Python AI → Node API → Frontend.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Node API | http://localhost:5000 |
| Python AI | http://localhost:8000 |

### 4. Manual Start (any OS)

```bash
# Terminal 1 — Python AI
cd python-ai
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2 — Node API
cd node-api
npm start

# Terminal 3 — Frontend
cd client
npm run dev
```

---

## API Reference

### Python AI Engine — `http://localhost:8000`

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Health check |
| `/analyze` | POST | Analyze resume → score, skills, gaps, roadmap, career paths |
| `/score-breakdown` | POST | Detailed scoring breakdown |
| `/career-path` | POST | Role match analysis |
| `/compare` | POST | Compare two resumes |

**`POST /analyze` — Request**
```json
{ "resume_text": "your full resume text here..." }
```

**`POST /analyze` — Response**
```json
{
  "readiness_score": 84,
  "skills": ["React", "TypeScript", "Node.js", "..."],
  "gap_skills": ["Kubernetes", "AWS"],
  "roadmap": ["Learn Docker basics", "..."],
  "career_paths": [
    {
      "role": "Full Stack Developer",
      "match_percent": 82,
      "salary_range": "$90k–$145k",
      "skills_needed": ["React", "Node.js", "..."],
      "matched_skills": ["React", "Node.js"],
      "missing_skills": ["Docker"]
    }
  ]
}
```

### Node API — `http://localhost:5000`

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `GET /health` | GET | — | Server health |
| `POST /api/auth/google` | POST | — | Google OAuth → JWT |
| `GET /api/auth/verify` | GET | Bearer | Verify JWT |
| `GET /api/user/profile` | GET | Bearer | Get user profile |
| `POST /api/resume/upload` | POST | Bearer | Upload resume |

---

## Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **MUI v5** — Component library with custom dark theme
- **Recharts** — Area, Radar, Bar, Donut charts
- **Zustand** — Global state management
- **React Router v6** — Client-side routing
- **`@react-oauth/google`** — Google OAuth integration

### Backend
- **Node.js** + **Express** — REST API + JWT auth
- **FastAPI** + **uvicorn** — Python AI engine
- **MongoDB** + **Mongoose** — Database
- **bcrypt** + **jsonwebtoken** — Auth security
- **express-rate-limit** — Rate limiting

---

## Project Highlights

### Recent Upgrades (v2.0)
- ✅ **Full mobile responsiveness** — Bottom nav bar, hamburger drawer, touch targets
- ✅ **Premium visual overhaul** — Priority matrix, SVG flowchart roadmap, animated severity bars
- ✅ **Python AI engine integrated** — `run-dev.bat` now starts all 4 services including FastAPI
- ✅ **History timeline** — Score progression area chart + delta badges + mini score rings
- ✅ **Career Path SVG flowchart** — Step nodes with glow, dashed connectors, role match rings
- ✅ **Skills Gap intelligence** — 2×2 impact/effort matrix, severity index bars, distribution chart
- ✅ **Bug fixes** — Rules of Hooks, `accessToken` key alignment, white smoky Recharts overlays

---

## Deployment

### Frontend (Netlify)

`netlify.toml` is configured at the repo root:

```toml
[build]
  base    = "client"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to   = "/index.html"
  status = 200
```

> **Note:** Set `VITE_GOOGLE_CLIENT_ID` and `VITE_API_URL` as environment variables in Netlify dashboard.

### Python AI (Render / Railway)

```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Node API (Railway / Heroku)

```bash
npm install
npm start
```

---

## License

MIT — free to use, fork, and build upon.

---

<div align="center">

Built with precision by **Kirtann** · Futrix AI v2.0 · 2026

</div>
