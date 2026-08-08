<div align="center">

# FUTRIX
### Career Twin

**Resume in. Readiness score, skill gaps, and a roadmap out. Zero hallucination.**

[![Frontend](https://img.shields.io/badge/frontend-live-D97757?style=flat-square)](https://futrix-ai.vercel.app)
[![Node API](https://img.shields.io/badge/node--api-live-6366F1?style=flat-square)](https://futrix-node-api.onrender.com)
[![Python AI](https://img.shields.io/badge/ai--engine-live-10B981?style=flat-square)](https://futrix-python-ai.onrender.com)
[![License](https://img.shields.io/badge/license-MIT-333333?style=flat-square)](#license)

[Live App](https://futrix-ai.vercel.app) · [API](https://futrix-node-api.onrender.com) · [AI Engine](https://futrix-python-ai.onrender.com)

</div>

---

## The Problem

```
  6 seconds        →   average time a recruiter spends on a resume
  1,000,000+       →   candidates rejected yearly for unclear skill signal
  0                →   objective way most candidates have to measure readiness
```

Talent isn't the bottleneck. Legibility is. Futrix turns raw resume text into
a measurable, explainable signal — what you have, what's missing, what to do next.

---

## How It Works

```
  PASTE RESUME              DETECT SKILLS              SCORE + GAPS               ROADMAP
  ┌──────────┐    text     ┌────────────┐   regex/db  ┌────────────┐   ranked   ┌────────────┐
  │  Upload  │ ──────────▶ │  160+ tech │ ──────────▶ │  0–100     │ ─────────▶ │  Prioritized│
  │  .txt    │             │  detected  │             │  readiness │            │  next steps │
  └──────────┘             └────────────┘             └────────────┘            └────────────┘
```

No LLM in the analysis path. Deterministic regex + dictionary matching only —
same input always produces the same output. Sub-100ms, no API cost, no hallucination.

---

## Architecture

```
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│   CLIENT     │  JWT   │   NODE API   │  HTTP  │  PYTHON AI   │
│  React + TS  │ ─────▶ │  Express 5   │ ─────▶ │  FastAPI     │
│  Vite / MUI  │ ◀───── │  Auth + CRUD │ ◀───── │  NLP Engine  │
└─────────────┘        └──────┬──────┘        └─────────────┘
                              │
                        ┌──────▼──────┐
                        │  MongoDB     │
                        │  Atlas       │
                        └─────────────┘
```

**Request lifecycle**
```
1. Frontend  →  POST /api/upload-resume        (Bearer token)
2. Node API  →  POST /analyze                  (proxy to Python engine)
3. Python AI →  extract skills → find gaps → score → match roles
4. Node API  →  persist to MongoDB, return payload
5. Frontend  →  render score ring, radar chart, roadmap
```

---

## Stack

```
FRONTEND    React 18 · TypeScript 5 · Vite 5 · MUI 7 · Recharts · Zustand · Framer Motion
BACKEND     Node 18 · Express 5 · Mongoose 9 · JWT · Google OAuth
AI ENGINE   Python 3.11 · FastAPI · Pydantic v2 · Uvicorn
DATABASE    MongoDB Atlas
INFRA       Docker Compose (local) · Vercel (frontend + API) · Render (AI engine)
```

<details>
<summary><strong>Full dependency table</strong></summary>

**Frontend — `client/`**

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.5 | Type safety |
| Vite | 5.4 | Build tool & dev server |
| Material UI (MUI) | 7.3 | Component library |
| React Router DOM | 7.13 | Client-side routing |
| Recharts | 3.8 | Radar, area, bar, donut charts |
| Zustand | 5.0 | Global auth state |
| Framer Motion | 12 | Page animations |
| GSAP | 3.15 | Spiral login animation |
| React Dropzone | 15 | Drag-and-drop upload |
| @react-oauth/google | 0.13 | Google One-Tap OAuth |
| Axios | 1.13 | HTTP client |

**Backend — `node-api/`**

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5.2 | Web framework |
| Mongoose | 9.2 | MongoDB ODM |
| JSON Web Token | 9.0 | Access + refresh auth |
| google-auth-library | 10.6 | Google ID token verification |
| Multer | 2.0 | File upload handling |

**AI Engine — `python-ai/`**

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | 0.100+ | REST API framework |
| Uvicorn | 0.22+ | ASGI server |
| Pydantic | v2 | Request/response validation |

</details>

---

## Core Logic

### Skill detection — boundary-safe matching

```python
_BOUNDARY = {"Go", "AI", "R", "C", "C#", "C++", "SQL", "GCP", "CSS", "HTML"}

def detect(skill, text):
    if skill in _BOUNDARY:
        pattern = rf'(?<![a-zA-Z]){re.escape(skill)}(?![a-zA-Z])'
        return bool(re.search(pattern, text, re.I))
    return skill.lower() in text.lower()
```
> Prevents `Go` matching `Google`, `R` matching `React`, `AI` matching `email`.

### Readiness score

```
base    = min(90, skills × 8 + 15)
penalty = gaps × 3
score   = min(100, max(10, base − penalty))
```

**5-dimension breakdown**

| Dimension | Formula |
|---|---|
| Skill Match | `(detected ∩ top-20 skills) / 20 × 100` |
| Stack Balance | `(frontend_pct + backend_pct) / 2` |
| Cloud Presence | `(detected ∩ {AWS, Azure, GCP}) / 3 × 100` |
| DevOps Score | `(detected ∩ devops_skills) / devops_count × 100` |
| Language Diversity | `min(100, detected_languages × 20)` |

### Gap suggestion — domain-scoped, never generic

```
frontend dev  →  never told to learn Kubernetes
DevOps eng    →  never told to learn React

IF has_frontend AND JS present AND TS missing   → suggest TypeScript
IF has_backend  AND Docker missing              → suggest Docker
IF has_devops   AND Docker present, K8s missing → suggest Kubernetes
IF has_ml       AND Docker missing              → suggest Docker (deployment)
```

### Career match

```
match_percent = (skills_user ∩ skills_role) / skills_role × 100
```

| Role | Salary | Core Skills |
|---|---|---|
| Frontend Engineer | $85k – $130k | React · TypeScript · CSS · HTML |
| Full Stack Developer | $90k – $145k | React · Node.js · MongoDB · Docker |
| Backend Engineer | $95k – $150k | Node.js · Python · MongoDB · AWS |
| DevOps Engineer | $100k – $160k | Docker · K8s · CI/CD · Linux |
| Data Engineer | $105k – $155k | Python · SQL · Spark · Airflow |
| ML Engineer | $120k – $180k | Python · TensorFlow · Docker |
| Cloud Architect | $130k – $200k | AWS · Terraform · K8s · Docker |

### Priority matrix — impact vs effort

```
   HIGH IMPACT              │              STRETCH
   ┌─────────────────────┐  │  ┌─────────────────────┐
   │  Docker      (3,9)   │  │  │  Kubernetes  (8,10)  │
   │  TypeScript  (3,8)   │  │  │  Go          (6,7)   │
   │  → do first          │  │  │  → plan for          │
   └─────────────────────┘  │  └─────────────────────┘
 ──────────────────────────────────────────────────────
   ┌─────────────────────┐  │  ┌─────────────────────┐
   │  QUICK WIN           │  │  │  LOW PRIORITY        │
   │  → fill gaps         │  │  │  → skip for now      │
   └─────────────────────┘  │  └─────────────────────┘
        LOW EFFORT          │           HIGH EFFORT
```

### Resume comparison (`/compare`)

```python
def compare_analyses(a, b):
    new_skills    = [s for s in b.skills     if s not in a.skills]
    resolved_gaps = [g for g in a.gap_skills if g not in b.gap_skills]
    score_delta   = b.readiness_score - a.readiness_score
    return { before, after, delta: { score_delta, new_skills, resolved_gaps } }
```
> Powers the History page — shows exactly which skills were added and which gaps closed between resume versions.

---

## Auth Flow

```
LOGIN     →  access token (15 min, HS256)  +  refresh token (7 day)
REQUEST   →  Authorization: Bearer <access>
REFRESH   →  verify + rotate + invalidate old refresh token
LOCKOUT   →  5 failed attempts → 2 hour lock
```

Passwordless throughout — Google OAuth or magic-link email only. No password ever stored.

---

## API Surface

<details>
<summary><strong>Node — Auth</strong></summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/login` | None | Passwordless email login |
| POST | `/api/auth/google` | None | Google ID token verify |
| POST | `/api/auth/refresh` | None | Rotate token pair |
| GET | `/api/auth/verify` | Bearer | Check access token |
| POST | `/api/auth/logout` | Bearer | Invalidate refresh token |

</details>

<details>
<summary><strong>Node — Analysis</strong></summary>

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload-resume` | Bearer | Analyze resume, persist to DB |
| GET | `/api/history` | Bearer | Last 20 analyses |
| GET | `/api/compare?id1=&id2=` | Bearer | Diff two analyses |
| POST | `/api/jobs/match` | Bearer | Match against job DB |

</details>

<details>
<summary><strong>Python — AI Engine</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/analyze` | Full pipeline |
| POST | `/score-breakdown` | 5-dimension score only |
| POST | `/career-path` | Role matching only |
| POST | `/compare` | Resume-to-resume delta |
| GET | `/` | Health check |

</details>

---

## Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Google OAuth + email, GSAP spiral animation |
| `/upload` | Upload Resume | Paste or drag-drop `.txt`, animated overlay |
| `/dashboard` | Dashboard | Score ring, skill tags, radar chart, roadmap preview |
| `/result` | Resume Result | Full breakdown: score, radar, donut, roadmap |
| `/skills-gap` | Skills Gap | Priority matrix, animated gap bars |
| `/career-path` | Career Path | SVG roadmap + role cards with mini score rings |
| `/history` | History | Score progression area chart + timeline |
| `/profile` | Profile | User info and account settings |

---

## Project Structure

```
career-twin-ai/
├── client/            React + TS frontend
│   └── src/
│       ├── pages/       Login · Upload · Dashboard · SkillsGap · CareerPath · History
│       ├── components/  ScoreRing · Sidebar · SpiralAnimation · charts/
│       └── store/       Zustand: useAuth · useResume
├── node-api/          Express REST layer
│   ├── routes/  models/  middleware/  utils/
├── python-ai/         FastAPI NLP engine
│   ├── main.py  ai_engine.py  skills_db.json
└── docker-compose.yml
```

---

## Run Locally

**Prerequisites:** Node.js 18+ · Python 3.11+ · MongoDB (local or Atlas) · Google OAuth Client ID

```bash
git clone https://github.com/your-username/futrix-ai.git
cd futrix-ai/career-twin-ai

# 1 — AI engine
cd python-ai && pip install -r requirements.txt
uvicorn main:app --reload --port 8000          # :8000

# 2 — API
cd ../node-api && npm install && node server.js # :5000

# 3 — Frontend
cd ../client && npm install && npm run dev      # :5173

# — or, all at once —
cd .. && docker-compose up --build
```

**`node-api/.env`**
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net/
PORT=5000
JWT_SECRET=<32-char-secret>
JWT_REFRESH_SECRET=<32-char-secret>
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**`client/.env`**
```env
VITE_GOOGLE_CLIENT_ID=<client-id>
VITE_API_URL=http://localhost:5000
```

---

## Example

**In**
```
React, TypeScript, Node.js, Python, MongoDB, Docker, Git, REST API
Built full-stack apps with React + Node.js. Deployed with Docker + AWS.
```

**Out**
```json
{
  "readiness_score": 79,
  "skills": ["React", "TypeScript", "Node.js", "Python", "MongoDB", "Docker", "AWS"],
  "gap_skills": ["Kubernetes", "CI/CD Pipeline"],
  "career_paths": [
    { "role": "Full Stack Developer", "match_percent": 100 },
    { "role": "Backend Engineer",     "match_percent": 100 },
    { "role": "Frontend Engineer",    "match_percent": 60 }
  ]
}
```

---

## Security

```
✓ 15-min access tokens, rotating refresh tokens
✓ Refresh tokens bound + validated in MongoDB
✓ 5 failed logins → 2hr lockout
✓ Rate-limited login (5 req / 15 min / IP)
✓ CORS whitelist
✓ No passwords, ever
```

---

## Deployment

```
FRONTEND    vercel --prod              (from client/)
NODE API    vercel --prod  or  Render  (from node-api/, render.yaml provided)
PYTHON AI   Render                     (from python-ai/, render.yaml provided)
```

---

## Skills Database

**160+ technologies** detected via `skills_db.json`:

```
Languages    Python · JavaScript · TypeScript · Java · Go · Rust · C++ · C# · Kotlin · Swift
Frontend     React · Vue · Angular · Next.js · Svelte · HTML · CSS · Tailwind
Backend      Node.js · Express · Django · Flask · FastAPI · Spring Boot
Databases    MongoDB · PostgreSQL · MySQL · Redis · DynamoDB · Elasticsearch
Cloud        AWS · Azure · GCP · Vercel · Netlify · Cloudflare
DevOps       Docker · Kubernetes · CI/CD · Terraform · Jenkins · GitHub Actions
ML/AI        TensorFlow · PyTorch · Scikit-Learn · Hugging Face · LangChain · RAG
Testing      Jest · Cypress · Selenium · Playwright · Pytest
Auth/API     OAuth · JWT · GraphQL · gRPC · REST API · Swagger
```

---

## Key Design Decisions

| Decision | Why |
|---|---|
| Text-only analysis, no LLM | Zero hallucination, sub-100ms responses, no API cost |
| Domain-scoped gaps | A frontend dev is never told to learn Spark |
| Passwordless auth | No password storage, hashing, or breach risk |
| Refresh token rotation | Prevents token reuse after logout or theft |
| Deterministic score formula | Reproducible, explainable, trustworthy — not an LLM opinion |

---

<div align="center">

**MIT License** — free to use, modify, distribute.

</div>
