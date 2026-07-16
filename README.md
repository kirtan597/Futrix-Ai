# Futrix AI — Career Twin

> **AI-powered resume analysis platform that solves the real-world skill mismatch problem.**  
> Upload your resume → get an instant readiness score, detected skills, prioritized skill gaps, and a personalized career roadmap — all derived strictly from your resume text with zero hallucination.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend (Vercel) | https://futrix-ai.vercel.app |
| Node.js API | https://futrix-node-api.onrender.com |
| Python AI Engine | https://futrix-python-ai.onrender.com |

> **Demo credentials:** Use any valid email address or sign in with Google OAuth.

---

## The Real-World Problem This Solves

**The Skill Mismatch Crisis:**  
Millions of job seekers are rejected not because they lack talent, but because they cannot clearly articulate their skills or identify what is missing for their target role. Recruiters spend an average of 6 seconds on a resume. Candidates have no objective way to measure their career readiness or know exactly what to learn next.

**How Futrix AI Solves It:**
1. **Objective Skill Extraction** — AI scans resume text and detects 160+ technologies with zero false positives using word-boundary regex matching.
2. **Context-Aware Gap Analysis** — Gaps are only suggested within the candidate's actual domain (frontend, backend, DevOps, ML) — never generic filler.
3. **Quantified Readiness Score** — A 0–100 score calculated purely from detected skills and gap count, giving candidates a measurable baseline.
4. **Prioritized Learning Roadmap** — Each gap is ranked by career impact vs learning effort, with specific course recommendations.
5. **Role Match Intelligence** — Detected skills are matched against 7 industry roles with salary ranges and match percentages.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FUTRIX AI PLATFORM                        │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   React/TS   │───▶│  Node.js API │───▶│  Python AI   │  │
│  │   Frontend   │    │  Express 5   │    │  FastAPI     │  │
│  │  (Vite/MUI)  │◀───│  JWT Auth    │◀───│  NLP Engine  │  │
│  └──────────────┘    └──────┬───────┘    └──────────────┘  │
│                             │                               │
│                      ┌──────▼───────┐                       │
│                      │   MongoDB    │                       │
│                      │   Atlas      │                       │
│                      └──────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

**Request Flow:**
1. User pastes resume text in the React frontend
2. Frontend sends `POST /api/upload-resume` with JWT Bearer token to Node.js API
3. Node.js API forwards resume text to Python FastAPI engine at `POST /analyze`
4. Python engine runs NLP skill extraction, gap analysis, scoring, and career path matching
5. Results are persisted to MongoDB and returned to the frontend
6. Frontend renders the dashboard with charts, score ring, skill tags, and roadmap

---

## Tech Stack

### Frontend — `client/`
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.5 | Type safety |
| Vite | 5.4 | Build tool & dev server |
| Material UI (MUI) | 7.3 | Component library |
| React Router DOM | 7.13 | Client-side routing |
| Recharts | 3.8 | Data visualization (radar, area, bar, donut charts) |
| Zustand | 5.0 | Global auth state management |
| Framer Motion | 12 | Page animations |
| GSAP | 3.15 | Spiral login animation |
| React Dropzone | 15 | Drag-and-drop .txt file upload |
| @react-oauth/google | 0.13 | Google One-Tap OAuth |
| Axios | 1.13 | HTTP client |

### Backend — `node-api/`
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5.2 | Web framework |
| Mongoose | 9.2 | MongoDB ODM |
| JSON Web Token | 9.0 | Access + refresh token auth |
| google-auth-library | 10.6 | Google ID token verification |
| Axios | 1.13 | Proxy calls to Python AI |
| Multer | 2.0 | File upload handling |
| dotenv | 17 | Environment config |

### AI Engine — `python-ai/`
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Runtime |
| FastAPI | 0.100+ | REST API framework |
| Uvicorn | 0.22+ | ASGI server |
| Pydantic | v2 | Request/response validation |

### Database
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted NoSQL — stores users and analysis history |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Local multi-service orchestration |
| Vercel | Frontend + Node.js API serverless deployment |
| Render | Python AI engine deployment |

---

## Project Structure

```
career-twin-ai/
├── client/                         # React TypeScript frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.tsx           # Google OAuth + email login
│   │   │   ├── UploadResume.tsx    # Resume paste + drag-drop
│   │   │   ├── Dashboard.tsx       # Main analytics dashboard
│   │   │   ├── ResumeResult.tsx    # Full analysis breakdown
│   │   │   ├── SkillsGap.tsx       # Gap priority matrix + bars
│   │   │   ├── CareerPath.tsx      # SVG roadmap + role cards
│   │   │   ├── History.tsx         # Score progression timeline
│   │   │   └── Profile.tsx         # User profile
│   │   ├── components/
│   │   │   ├── ScoreRing.tsx       # Animated SVG score ring
│   │   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   │   ├── SpiralAnimation.tsx # GSAP login background
│   │   │   ├── FutrixLogo.tsx      # Brand logo component
│   │   │   └── charts/
│   │   │       ├── SkillRadar.tsx  # Recharts radar chart
│   │   │       ├── GapDonut.tsx    # Coverage donut chart
│   │   │       └── ScoreArea.tsx   # Score progression area chart
│   │   ├── store/
│   │   │   ├── useAuth.ts          # Zustand auth store
│   │   │   └── useResume.ts        # Resume state store
│   │   ├── services/
│   │   │   └── apiService.ts       # Singleton API client with auto token refresh
│   │   └── App.tsx                 # Router + protected routes
│   ├── vite.config.ts              # Vite proxy config
│   └── package.json
│
├── node-api/                       # Express.js REST API
│   ├── server.js                   # App entry point + MongoDB connect
│   ├── routes/
│   │   └── userRoutes.js           # All API route handlers
│   ├── models/
│   │   ├── User.js                 # User schema (email, googleId, tokens)
│   │   └── Analysis.js             # Analysis schema (skills, gaps, score)
│   ├── middleware/
│   │   ├── auth.js                 # JWT Bearer token verification
│   │   └── rateLimiter.js          # In-memory IP rate limiter
│   ├── utils/
│   │   └── authUtils.js            # JWT sign/verify helpers
│   ├── api/
│   │   └── index.js                # Vercel serverless entry
│   ├── Dockerfile
│   └── package.json
│
├── python-ai/                      # FastAPI AI engine
│   ├── main.py                     # FastAPI app + route definitions
│   ├── ai_engine.py                # Core NLP analysis logic
│   ├── skills_db.json              # 160+ technology skill database
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml              # Multi-service local orchestration
└── README.md
```

---

## Core Algorithms

### 1. Skill Extraction Algorithm (`ai_engine.py`)

The engine uses a **two-tier text-bounded matching** strategy to prevent false positives:

```python
_BOUNDARY_SKILLS = {"Go", "AI", "R", "C", "C#", "C++", "SQL", "GCP", "CSS", "HTML"}

def _skill_present(skill: str, text: str) -> bool:
    if skill in _BOUNDARY_SKILLS:
        # Word-boundary regex for short/ambiguous terms
        # Prevents "Go" matching "Google", "AI" matching "email"
        pattern = rf'(?<![a-zA-Z]){re.escape(skill)}(?![a-zA-Z])'
        return bool(re.search(pattern, text, re.IGNORECASE))
    else:
        # Case-insensitive substring match for unambiguous multi-char terms
        return skill.lower() in text.lower()
```

**Why this matters:** Naive substring matching would detect "Go" inside "Google", "R" inside "React", "AI" inside "email". The boundary regex eliminates all false positives while maintaining recall for legitimate matches.

---

### 2. Context-Aware Gap Analysis Algorithm

Gaps are **never generic** — they are only suggested when logically related to the candidate's detected domain:

```
Domain Detection:
  has_frontend = skills ∩ {React, Vue, Angular, JavaScript, TypeScript, HTML, CSS} ≠ ∅
  has_backend  = skills ∩ {Node.js, Python, Java, Django, Flask, FastAPI} ≠ ∅
  has_devops   = skills ∩ {Docker, Kubernetes, CI/CD, Terraform, Linux} ≠ ∅
  has_ml       = skills ∩ {Machine Learning, TensorFlow, PyTorch} ≠ ∅

Gap Rules (examples):
  IF has_frontend AND TypeScript ∉ skills AND JavaScript ∈ skills → suggest TypeScript
  IF has_backend AND Docker ∉ skills → suggest Docker
  IF has_devops AND Kubernetes ∉ skills AND Docker ∈ skills → suggest Kubernetes
  IF has_ml AND Docker ∉ skills → suggest Docker (Model Deployment)
```

This ensures a pure frontend developer is never told to learn Kubernetes, and a DevOps engineer is never told to learn React.

---

### 3. Readiness Score Formula

```
base_score  = min(90, skill_count × 8 + 15)
penalty     = gap_count × 3
raw_score   = max(10, base_score - penalty)
final_score = min(100, raw_score)

Edge cases:
  skill_count = 0 → score = 0
  score always in range [0, 100]
```

**Score Breakdown (5 dimensions):**
| Dimension | Formula |
|---|---|
| Skill Match | `(detected ∩ top-20 skills) / 20 × 100` |
| Stack Balance | `(frontend_pct + backend_pct) / 2` |
| Cloud Presence | `(detected ∩ {AWS, Azure, GCP}) / 3 × 100` |
| DevOps Score | `(detected ∩ devops_skills) / devops_count × 100` |
| Language Diversity | `min(100, detected_languages × 20)` |

---

### 4. Career Path Matching Algorithm

```
For each role in ROLE_CATALOG:
  matched   = [skill for skill in role.skills_needed if skill ∈ user_skills]
  missing   = [skill for skill in role.skills_needed if skill ∉ user_skills]
  match_pct = round(len(matched) / len(role.skills_needed) × 100)

Results sorted by match_pct descending
```

**Role Catalog (7 roles):**
| Role | Salary Range | Key Skills |
|---|---|---|
| Frontend Engineer | $85k–$130k | React, TypeScript, JavaScript, CSS, HTML |
| Full Stack Developer | $90k–$145k | React, Node.js, MongoDB, REST API, Docker |
| Backend Engineer | $95k–$150k | Node.js, Python, MongoDB, Docker, AWS |
| DevOps Engineer | $100k–$160k | Docker, Kubernetes, CI/CD, AWS, Linux |
| Data Engineer | $105k–$155k | Python, SQL, Spark, AWS, Airflow |
| ML Engineer | $120k–$180k | Python, Machine Learning, TensorFlow, Docker |
| Cloud Architect | $130k–$200k | AWS, Kubernetes, Terraform, Docker |

---

### 5. Impact vs Effort Priority Matrix

Each gap skill is scored on two axes for the 2×2 quadrant visualization:

| Quadrant | Effort | Impact | Action |
|---|---|---|---|
| High Impact (top-left) | Low | High | Do first |
| Stretch (top-right) | High | High | Plan for |
| Quick Win (bottom-left) | Low | Low | Fill gaps |
| Low Priority (bottom-right) | High | Low | Skip for now |

Example mappings:
```
Docker:     effort=3, impact=9  → High Impact quadrant
Kubernetes: effort=8, impact=10 → Stretch quadrant
TypeScript: effort=3, impact=8  → High Impact quadrant
Go:         effort=6, impact=7  → Stretch quadrant
```

---

### 6. JWT Authentication Flow

```
Login:
  POST /api/login or POST /api/auth/google
  → generateAccessToken(user)  [15 min expiry, HS256]
  → generateRefreshToken(user) [7 day expiry, separate secret]
  → refreshToken stored in MongoDB user document

Protected Request:
  Authorization: Bearer <accessToken>
  → auth middleware verifies with JWT_SECRET
  → req.user = { id, email, role }

Token Refresh:
  POST /api/auth/refresh { refreshToken }
  → verify with JWT_REFRESH_SECRET
  → compare against stored refreshToken in DB (rotation check)
  → issue new access + refresh token pair

Account Lock:
  5 failed login attempts → lock for 2 hours
  lockUntil stored in User document
```

---

### 7. Resume Comparison Algorithm (`/compare` endpoint)

```python
def compare_analyses(a, b):
    new_skills    = [s for s in b.skills     if s not in a.skills]
    resolved_gaps = [g for g in a.gap_skills if g not in b.gap_skills]
    remaining     = b.gap_skills
    score_delta   = b.readiness_score - a.readiness_score

    return { before, after, delta: { score_change, new_skills, resolved_gaps, remaining_gaps } }
```

This powers the History page's progress tracking — showing exactly which skills were added and which gaps were closed between resume versions.

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/login` | None | Email-based passwordless login |
| POST | `/api/auth/google` | None | Google OAuth ID token verification |
| POST | `/api/auth/refresh` | None | Rotate access + refresh tokens |
| GET | `/api/auth/verify` | Bearer | Verify current access token |
| POST | `/api/auth/logout` | Bearer | Invalidate refresh token |

### Analysis Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload-resume` | Bearer | Analyze resume text, persist to DB |
| GET | `/api/history` | Bearer | Fetch last 20 analyses for user |
| GET | `/api/compare?id1=&id2=` | Bearer | Compare two analyses, return delta |
| POST | `/api/jobs/match` | Bearer | Match skills against job database |

### Python AI Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/analyze` | Full resume analysis (skills + gaps + score + roadmap + career paths) |
| POST | `/score-breakdown` | 5-dimension score breakdown only |
| POST | `/career-path` | Career path matching for a given skill list |
| POST | `/compare` | Compare two resume texts, return delta |
| GET | `/` | Health check |

---

## Data Models

### User (MongoDB)
```javascript
{
  email:         String (unique, required),
  name:          String,
  googleId:      String,
  avatar:        String,
  refreshToken:  String,
  lastLogin:     Date,
  loginAttempts: Number (default: 0),
  lockUntil:     Date,
  timestamps:    true
}
```

### Analysis (MongoDB)
```javascript
{
  email:           String (indexed),
  resumeText:      String,
  skills:          [String],
  gap_skills:      [String],
  readiness_score: Number,
  roadmap:         [String],
  score_breakdown: {
    skill_match, stack_balance, cloud_presence, devops_score, language_div
  },
  career_paths: [{
    role, match_percent, salary_range, skills_needed
  }],
  timestamps: true   // compound index on (email, createdAt)
}
```

---

## Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Google OAuth + email login with GSAP spiral animation |
| `/upload` | Upload Resume | Paste or drag-drop .txt resume, animated analysis overlay |
| `/dashboard` | Dashboard | Score ring, skill tags, gap chips, radar chart, roadmap preview |
| `/result` | Resume Result | Full breakdown: score, radar, donut, skills, gaps, AI tips, roadmap |
| `/skills-gap` | Skills Gap | Priority matrix, animated gap bars, bar chart, impact vs effort |
| `/career-path` | Career Path | SVG flowchart roadmap + role match cards with mini score rings |
| `/history` | History | Score progression area chart + timeline of past analyses |
| `/profile` | Profile | User info and account settings |

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB (local or Atlas URI)
- Google OAuth Client ID (for Google login)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/futrix-ai.git
cd futrix-ai/career-twin-ai
```

### 2. Start the Python AI Engine
```bash
cd python-ai
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# Running at http://localhost:8000
```

### 3. Start the Node.js API
```bash
cd node-api
npm install
# Create .env (see node-api/.env.example)
node server.js
# Running at http://localhost:5000
```

**Required `node-api/.env`:**
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxx.mongodb.net/
PORT=5000
JWT_SECRET=<your-32-char-secret>
JWT_REFRESH_SECRET=<your-32-char-refresh-secret>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 4. Start the React Frontend
```bash
cd client
npm install
# Create .env (see client/.env.example)
npm run dev
# Running at http://localhost:5173
```

**Required `client/.env`:**
```env
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
VITE_API_URL=http://localhost:5000
```

### 5. Run with Docker Compose (all services)
```bash
cd career-twin-ai
docker-compose up --build
```
Services:
- Frontend: http://localhost:5173
- Node API: http://localhost:5000
- Python AI: http://localhost:8000
- MongoDB: localhost:27017

---

## Example Analysis

**Input Resume Text:**
```
Software Engineer with 3 years of experience.
Skills: React, TypeScript, Node.js, Python, MongoDB, Docker, Git, REST API
Experience:
- Built full-stack web applications using React and Node.js
- Deployed services using Docker and AWS
- Worked in Agile/Scrum teams
```

**Output:**
```json
{
  "skills": ["React", "TypeScript", "Node.js", "Python", "MongoDB", "Docker", "Git", "REST API", "AWS", "Agile", "Scrum"],
  "gap_skills": ["Kubernetes", "CI/CD Pipeline"],
  "readiness_score": 79,
  "roadmap": [
    "Learn Kubernetes",
    "Learn CI/CD Pipeline",
    "Build a portfolio project combining your detected skills",
    "Prepare for technical interviews in your domain"
  ],
  "score_breakdown": {
    "skill_match": 55.0,
    "stack_balance": 62.5,
    "cloud_presence": 33.3,
    "devops_score": 28.6,
    "language_div": 40.0
  },
  "career_paths": [
    { "role": "Full Stack Developer", "match_percent": 100, "salary_range": "$90k–$145k" },
    { "role": "Backend Engineer",     "match_percent": 100, "salary_range": "$95k–$150k" },
    { "role": "Frontend Engineer",    "match_percent": 60,  "salary_range": "$85k–$130k" }
  ]
}
```

---

## Security Features

- **JWT Rotation** — Access tokens expire in 15 minutes; refresh tokens rotate on every use
- **Refresh Token Binding** — Refresh tokens are stored in MongoDB and validated on each rotation (prevents token reuse after logout)
- **Account Lockout** — 5 failed login attempts triggers a 2-hour lock
- **Rate Limiting** — Login endpoints limited to 5 requests per 15 minutes per IP
- **CORS Whitelist** — Only allowed origins can call the API
- **No Passwords** — Passwordless email login + Google OAuth only; no password storage
- **Input Validation** — Resume text minimum 50 characters enforced at both API and AI layer

---

## Deployment

### Frontend → Vercel
```bash
cd client
vercel --prod
# Set VITE_GOOGLE_CLIENT_ID and VITE_API_URL in Vercel dashboard
```

### Node.js API → Vercel (Serverless) or Render
The `api/index.js` file exports the Express app for Vercel serverless functions.
```bash
cd node-api
vercel --prod
# Or deploy to Render using render.yaml
```

### Python AI → Render
```bash
cd python-ai
# render.yaml is pre-configured
# Set ALLOWED_ORIGINS env var to your frontend URL
```

---

## Skills Database

The AI engine detects **160+ technologies** from `skills_db.json`, organized across:

- **Languages:** Python, JavaScript, TypeScript, Java, Go, Rust, C++, C#, Kotlin, Swift, PHP, Ruby, Scala, R, Dart
- **Frontend:** React, Vue, Angular, Next.js, Svelte, HTML, CSS, Tailwind, Bootstrap
- **Backend:** Node.js, Express, Django, Flask, FastAPI, Spring Boot, Ruby on Rails
- **Databases:** MongoDB, PostgreSQL, MySQL, Redis, SQLite, DynamoDB, Cassandra, Neo4j, Elasticsearch
- **Cloud:** AWS, Azure, GCP, Vercel, Netlify, Heroku, DigitalOcean, Cloudflare
- **AWS Services:** S3, Lambda, EC2, ECS, Fargate, CloudFormation
- **DevOps:** Docker, Kubernetes, CI/CD, Terraform, Ansible, Jenkins, GitHub Actions, CircleCI
- **ML/AI:** TensorFlow, PyTorch, Scikit-Learn, Keras, OpenCV, Hugging Face, LangChain, RAG, LLM
- **Testing:** Jest, Cypress, Selenium, Playwright, Pytest, JUnit
- **Monitoring:** Prometheus, Grafana, Datadog, Sentry
- **Messaging:** Apache Kafka, RabbitMQ
- **Auth/API:** OAuth, JWT, GraphQL, gRPC, WebSocket, REST API, Swagger

---

## Key Design Decisions

1. **Text-only analysis, no LLM** — The AI engine uses deterministic regex + dictionary matching instead of an LLM. This guarantees zero hallucination, consistent results, and sub-100ms response times without API costs.

2. **Domain-scoped gaps** — A frontend developer should never be told to learn Spark or Airflow. Gap suggestions are gated behind domain detection flags, making every recommendation actionable and relevant.

3. **Passwordless auth** — Eliminates password storage, hashing, and breach risk entirely. Users authenticate via Google OAuth or a magic-link-style email token.

4. **Refresh token rotation** — Every token refresh issues a new refresh token and invalidates the old one. This prevents refresh token reuse after logout or theft.

5. **Strict score formula** — The readiness score is a deterministic formula, not an LLM opinion. This makes it reproducible, explainable, and trustworthy.

---

## License

MIT License — free to use, modify, and distribute.
