<div align="center">

# ⚡ Futrix AI

### Autonomous Career Intelligence Platform

**Deterministic resume analysis · AI skill gap detection · ATS scoring · Career path matching**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-2.1-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)

</div>

---

## 📐 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    BROWSER / React Client                     │
│     Vite + TypeScript + MUI · Firebase Web SDK               │
│     Routes: /login /upload /dashboard /skills-gap             │
│             /career-path /ats-check /history /profile         │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTPS  JWT Bearer token
                         │
┌────────────────────────▼─────────────────────────────────────┐
│              Node.js API  (Express v5)                        │
│              node-api/  ·  Port 5000                          │
│                                                               │
│  Middleware Stack:                                            │
│  cors → json → auth(JWT) → rateLimiter → route → error       │
│                                                               │
│  Auth: Firebase Admin SDK + JWT (15m access / 7d refresh)    │
│  DB:   Supabase (users, analyses, refresh_tokens)            │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP  X-Internal-Secret
                         │  (never exposed to browser)
┌────────────────────────▼─────────────────────────────────────┐
│           Python AI Engine  (FastAPI + Uvicorn)              │
│           python-ai/  ·  Port 8000                           │
│                                                               │
│  Endpoints: /analyze /ats-check /score-breakdown             │
│             /career-path /compare                            │
│  Engine:    Deterministic NLP · skills_db.json (40+ skills)  │
└──────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                 Supabase (PostgreSQL)                         │
│  Tables: users · analyses · refresh_tokens                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
User (Browser)              Node API                Firebase Admin
     │                          │                         │
     │──── Email/Password ─────►│                         │
     │                          │──── verifyIdToken ─────►│
     │                          │◄─── decoded token ──────│
     │                          │
     │                          │── findOrCreateUser() ──►[Supabase]
     │                          │── generateTokens() ─────►[JWT pair]
     │                          │── storeRefreshToken() ──►[Supabase]
     │
     │◄── { accessToken(15m), refreshToken(7d), user } ───│
     │
     │  (stores both in localStorage + Zustand)
     │
     │  [ On token expiry — automatic refresh ]
     │──── POST /api/auth/refresh ─────────────────────────►│
     │                          │── verifyRefreshToken() ──►│
     │                          │── revokeOldToken() ───────►[Supabase]
     │                          │── storeNewToken() ─────────►[Supabase]
     │◄─── { new accessToken, new refreshToken } ───────────│
```

---

## 🗂️ Project Structure

```
Futrix-Ai/
├── client/                    ← React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── pages/             ← Login · UploadResume · Dashboard · History
│   │   │                         ResumeResult · SkillsGap · CareerPath
│   │   │                         ATSCheck · Profile
│   │   ├── services/
│   │   │   ├── apiService.ts  ← PRIMARY http client (fetch + auto-refresh)
│   │   │   ├── api.ts         ← Legacy axios instance (only kept for reference)
│   │   │   ├── firebase.ts    ← Firebase Web SDK auth helpers
│   │   │   └── resumeParser.ts← Client-side .txt file reader
│   │   ├── store/
│   │   │   ├── useAuth.ts     ← Zustand auth state (tokens + user)
│   │   │   └── useResume.ts   ← Resume analysis result state
│   │   └── components/        ← Sidebar · ScoreRing · Charts · ServiceStatus
│   └── vite.config.ts         ← Dev proxy: /api → localhost:5000
│
├── node-api/                  ← Express v5 + Node 18+
│   ├── server.js              ← App entry, CORS, health endpoint
│   ├── routes/
│   │   └── userRoutes.js      ← All API routes (auth + resume + profile)
│   ├── middleware/
│   │   ├── auth.js            ← JWT Bearer token verification
│   │   └── rateLimiter.js     ← In-memory sliding-window rate limiter
│   ├── db/
│   │   ├── supabaseClient.js  ← Supabase client + in-memory fallback
│   │   ├── userRepo.js        ← User CRUD (Supabase)
│   │   ├── analysisRepo.js    ← Analysis CRUD (Supabase)
│   │   └── refreshTokenRepo.js← Token rotation + revocation
│   └── utils/
│       ├── authUtils.js       ← JWT sign/verify helpers
│       ├── firebaseAdmin.js   ← Firebase Admin SDK (multi-source init)
│       └── serviceWarmer.js   ← Keeps Python AI warm in production
│
├── python-ai/                 ← FastAPI + Uvicorn
│   ├── main.py                ← FastAPI app + route definitions
│   ├── ai_engine.py           ← NLP engine (skill extraction, scoring, ATS)
│   └── skills_db.json         ← 40+ known tech skills database
│
├── render.yaml                ← Render.com deployment config
├── .agents/rules/PROJECT_RULES.md ← Mandatory project coding rules
└── .gitignore
```

---

## 🔌 API Endpoint Reference

### Node API (`/api`) — Public base: `https://futrix-node-api.onrender.com`

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/login` | — | Email magic login → JWT pair |
| `POST` | `/api/auth/firebase` | — | Firebase ID token → JWT pair |
| `POST` | `/api/auth/refresh` | — | Rotate refresh token (invalidates old) |
| `POST` | `/api/auth/logout` | — | Revoke refresh token server-side |
| `GET` | `/api/auth/verify` | ✅ | Validate JWT + return user profile |
| `GET` | `/api/profile` | ✅ | Fetch authenticated user profile |
| `PUT` | `/api/profile` | ✅ | Update name / avatar |
| `POST` | `/api/upload-resume` | ✅ | Analyze resume → save → return AI data |
| `GET` | `/api/history` | ✅ | User's analysis history (by JWT, max 20) |
| `GET` | `/api/compare?id1=&id2=` | ✅ | Compare two analyses (IDOR protected) |
| `POST` | `/api/jobs/match` | ✅ | Match skill array to job database |
| `POST` | `/api/ats-check` | ✅ | ATS heuristic audit via Python AI |
| `GET` | `/health` | — | Service health + DB status |

### Python AI — Internal only (called by Node API)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/analyze` | Full resume NLP analysis |
| `POST` | `/ats-check` | ATS 5-pillar audit |
| `POST` | `/score-breakdown` | Score breakdown only |
| `POST` | `/career-path` | Career path from skills list |
| `POST` | `/compare` | Compare two resume texts |
| `GET` | `/health` | Health check |

> All Python endpoints except `/health` require `X-Internal-Secret` header matching `INTERNAL_API_SECRET`.

---

## 🗃️ Database Schema

```sql
-- Users table (Supabase PostgreSQL)
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT,
  auth_provider TEXT DEFAULT 'email',
  firebase_uid  TEXT,
  google_id     TEXT,
  avatar        TEXT,
  login_attempts INT DEFAULT 0,
  lock_until    TIMESTAMPTZ,
  last_login    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses table
CREATE TABLE analyses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id),
  email                 TEXT NOT NULL,
  resume_text           TEXT,
  skills                TEXT[] DEFAULT '{}',
  gap_skills            TEXT[] DEFAULT '{}',
  readiness_score       NUMERIC DEFAULT 0,
  roadmap               TEXT[] DEFAULT '{}',
  score_breakdown       JSONB,
  career_paths          JSONB DEFAULT '[]',
  skill_weights         JSONB DEFAULT '[]',
  category_distribution JSONB DEFAULT '[]',
  readiness_trajectory  JSONB,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id),
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- A Supabase project (or run with in-memory fallback)
- Firebase project with Web + Admin SDK credentials

### 1. Clone & Install

```bash
git clone https://github.com/kirtan597/Futrix-Ai.git
cd Futrix-Ai

# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..

# Install node-api dependencies
cd node-api && npm install && cd ..

# Install python-ai dependencies
cd python-ai && pip install -r requirements.txt && cd ..
```

### 2. Configure Environment

```bash
# Node API
cp node-api/.env.example node-api/.env
# Edit node-api/.env with your Supabase + Firebase credentials

# Client
cp client/.env.example client/.env
# Edit client/.env with your Firebase web config + VITE_API_URL=http://localhost:5000

# Python AI
# Copy and set INTERNAL_API_SECRET (must match node-api)
echo "INTERNAL_API_SECRET=your_secret_here" > python-ai/.env
```

### 3. Run All Services

```bash
# Terminal 1 — Python AI Engine (port 8000)
cd python-ai
uvicorn main:app --reload --port 8000

# Terminal 2 — Node API (port 5000)
cd node-api
node server.js

# Terminal 3 — React Client (port 5173)
cd client
npm run dev
```

> The Vite dev proxy automatically routes `/api/*` → `localhost:5000`, so no CORS issues in dev.

---

## ☁️ Production Deployment (Render + Netlify)

### Services on Render

| Service | Runtime | Root Dir | Start Command |
|---------|---------|----------|---------------|
| `futrix-node-api` | Node 18 | `node-api/` | `node server.js` |
| `futrix-python-ai` | Python 3.11 | `python-ai/` | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

### Required Environment Variables

**`futrix-node-api` (Render dashboard)**
```
NODE_ENV              = production
SUPABASE_URL          = https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY = <service role key>
JWT_SECRET            = <auto-generated>
JWT_REFRESH_SECRET    = <auto-generated>
INTERNAL_API_SECRET   = <auto-generated — copy this value to python-ai>
PYTHON_URL            = https://futrix-python-ai.onrender.com
FRONTEND_URL          = https://futrixai.netlify.app
FIREBASE_PROJECT_ID   = futrix-ai
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-...@futrix-ai.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY  = -----BEGIN PRIVATE KEY-----\n...
```

**`futrix-python-ai` (Render dashboard)**
```
INTERNAL_API_SECRET = <same value as node-api>
ALLOWED_ORIGINS     = https://futrix-node-api.onrender.com,https://futrixai.netlify.app
```

**Netlify (client environment)**
```
VITE_API_URL                     = https://futrix-node-api.onrender.com
VITE_FIREBASE_API_KEY            = ...
VITE_FIREBASE_AUTH_DOMAIN        = futrix-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID         = futrix-ai
VITE_FIREBASE_STORAGE_BUCKET     = futrix-ai.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID= ...
VITE_FIREBASE_APP_ID             = ...
```

---

## 🔑 Security Model

```
┌─────────────────────────────────────────────────────────────┐
│  Layer            │  Mechanism                              │
├─────────────────────────────────────────────────────────────│
│  Firebase Auth    │  Email/password + Google OAuth          │
│  JWT Access       │  HS256 · 15 minute TTL                  │
│  JWT Refresh      │  HS256 · 7 day TTL · DB-tracked         │
│  Token Rotation   │  Old token revoked on every refresh     │
│  IDOR Protection  │  owner check on all user-scoped data    │
│  Rate Limiting    │  10/login · 20/firebase · 100/resume    │
│  Internal Auth    │  X-Internal-Secret (Node→Python)        │
│  CORS             │  Strict origin whitelist (no wildcard)  │
│  Input Validation │  min 50 / max 50,000 chars on resume    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 AI Engine — How It Works

```
Resume Text Input (plain text)
        │
        ▼
┌──────────────────────┐
│  Skill Extraction    │  Word-boundary regex + substring match
│  against skills_db   │  40+ known technologies · zero hallucination
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐   ┌──────────────────────┐
│  Gap Detection       │   │  Score Breakdown      │
│  (detected vs role   │   │  skill_match          │
│   benchmark skills)  │   │  stack_balance        │
└──────────┬───────────┘   │  cloud_presence       │
           │               │  devops_score         │
           ▼               └──────────────────────┘
┌──────────────────────┐
│  Readiness Score     │  0–100 composite weighted score
│  (0–100)             │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐   ┌──────────────────────┐
│  Career Path Match   │   │  ATS 5-Pillar Audit   │
│  Role catalog match% │   │  • Formatting risk    │
│  Salary ranges       │   │  • Section presence   │
│  Missing skills      │   │  • Date parseability  │
└──────────────────────┘   │  • Keyword match      │
                           │  • File integrity     │
                           └──────────────────────┘
```

---

## 🖥️ Client Pages

| Route | Page | API Calls |
|-------|------|-----------|
| `/login` | Login | `POST /api/auth/firebase` |
| `/upload` | Upload Resume | `POST /api/upload-resume` |
| `/dashboard` | Dashboard | localStorage (`analysisResult`) |
| `/result` | Resume Result | localStorage + `GET /api/history` |
| `/skills-gap` | Skills Gap | localStorage + `GET /api/history` |
| `/career-path` | Career Path | localStorage + `GET /api/history` |
| `/ats-check` | ATS Audit | `POST /api/ats-check` |
| `/history` | History | `GET /api/history` |
| `/profile` | Profile | `GET /api/profile` · `GET /api/history` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript · Vite · Material UI v5 |
| State | Zustand |
| Charts | Recharts · Framer Motion |
| Auth (client) | Firebase Web SDK v10 |
| HTTP Client | `apiService.ts` (fetch + auto token-refresh) |
| API Server | Node.js 18 · Express v5 |
| Auth (server) | Firebase Admin SDK · jsonwebtoken |
| Database | Supabase (PostgreSQL) · In-memory fallback (dev) |
| AI Engine | Python 3.11 · FastAPI · Uvicorn |
| Deployment | Render (Node + Python) · Netlify (React) |

---

## 📋 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `POST /api/login` | 10 requests | 15 min |
| `POST /api/auth/firebase` | 20 requests | 15 min |
| `POST /api/upload-resume` | 100 requests | 15 min |

---

## 🤝 Contributing

1. Read [`.agents/rules/PROJECT_RULES.md`](.agents/rules/PROJECT_RULES.md) — mandatory rules for all contributions
2. All API calls from the client **must** use `apiService` from `services/apiService.ts`
3. All protected Node API routes **must** use the `auth` middleware
4. All Python endpoints except `/health` **must** validate `X-Internal-Secret`
5. Never commit `.env` files or `serviceAccountKey.json`

---

<div align="center">

Built with ⚡ by [Kirtan](https://github.com/kirtan597) · Powered by Firebase · Supabase · Render · Netlify

</div>
