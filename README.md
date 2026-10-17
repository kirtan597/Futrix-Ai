<div align="center">

# ⚡ Futrix AI — Career Intelligence Twin

### Enterprise-Grade Deterministic Career Intelligence & AI Resume Optimization Platform

**Zero-Hallucination Resume Analysis · 5-Pillar ATS Scoring · Skill Gap Diagnostic · Interactive Career Path Modeling**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-2.1-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Firebase](https://img.shields.io/badge/Firebase-Admin%20%26%20Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)

</div>

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Component Hierarchy & UI System](#-component-hierarchy--ui-system)
- [End-to-End Data & Execution Flow](#-end-to-end-data--execution-flow)
- [Multi-Provider Authentication & Token Rotation](#-multi-provider-authentication--token-rotation)
- [Deterministic AI Engine & 5-Pillar ATS Heuristics](#-deterministic-ai-engine--5-pillar-ats-heuristics)
- [Project Directory Structure](#-project-directory-structure)
- [API Endpoint Reference](#-api-endpoint-reference)
- [Database Entity-Relationship Model](#-database-entity-relationship-model)
- [Local Development & Testing](#-local-development--testing)
- [Production Deployment](#-production-deployment)
- [Security Model & Rate Limiting](#-security-model--rate-limiting)

---

## 📐 System Architecture

Futrix AI is architected as an enterprise decoupled monorepo comprising a modern Single-Page Application (SPA), a secure API Gateway/BFF with persistent Supabase PostgreSQL storage, and a high-throughput deterministic Python NLP Microservice.

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ Frontend Client (Port 5173 / Production CDN)"]
        UI["React 18 SPA + Vite + TypeScript"]
        Theme["Material UI (MUI v5) Dark Glassmorphism"]
        Zustand["Zustand State Stores (useAuth, useResume, useErrorStore)"]
        HTTPClient["Resilient API Client (Fetch + Auto Token Refresh)"]
        UI --> Theme
        UI --> Zustand
        UI --> HTTPClient
    end

    subgraph GatewayLayer["🛡️ Backend API Gateway (Port 5000 / Node.js Express)"]
        ProxyRouter["Express Router & Controller Layer"]
        CORS["Strict CORS Whitelist"]
        AuthMW["JWT Bearer Authentication & IDOR Guard"]
        RateLimiter["Sliding-Window Rate Limiter"]
        UserRepo["User Repository"]
        AnalysisRepo["Analysis Repository"]
        TokenRepo["Refresh Token Repository"]
        Warmer["Service Warmer (Cold-start mitigation)"]

        ProxyRouter --> CORS --> RateLimiter --> AuthMW
        AuthMW --> UserRepo
        AuthMW --> AnalysisRepo
        AuthMW --> TokenRepo
    end

    subgraph AILayer["🧠 AI Engine Microservice (Port 8000 / FastAPI + Python)"]
        FastAPIApp["FastAPI REST App"]
        InternalSecretAuth["X-Internal-Secret Auth Dependency"]
        DeterministicNLP["Deterministic Skill Extractor (Regex + Word Boundaries)"]
        SkillDB[("Taxonomy: skills_db.json (40+ Technologies)")]
        GapEngine["Skill Gap & Roadmap Generator"]
        ATSChecker["5-Pillar ATS Auditing Heuristic Engine"]
        CareerMatrix["Career Path & Benchmark Scoring Matrix"]

        FastAPIApp --> InternalSecretAuth
        InternalSecretAuth --> DeterministicNLP
        DeterministicNLP --- SkillDB
        DeterministicNLP --> GapEngine
        DeterministicNLP --> ATSChecker
        DeterministicNLP --> CareerMatrix
    end

    subgraph DataLayer["🗄️ Persistence & Identity Cloud"]
        SupabaseDB[("Supabase PostgreSQL\n- users\n- analyses (JSONB)\n- refresh_tokens")]
        FirebaseCloud["Firebase Auth / Google Identity Services"]
    end

    %% Inter-tier connections
    HTTPClient -->|"HTTPS / REST (JWT Bearer)"| ProxyRouter
    UserRepo -->|"PostgreSQL (Connection Pool)"| SupabaseDB
    AnalysisRepo -->|"PostgreSQL (JSONB Storage)"| SupabaseDB
    TokenRepo -->|"PostgreSQL (SHA-256 Hashes)"| SupabaseDB
    GatewayLayer -->|"Internal HTTP + X-Internal-Secret"| FastAPIApp
    GatewayLayer -.->|"Token Verification"| FirebaseCloud
    Warmer -.->|"Periodic Liveness Probes"| FastAPIApp
```

---

## 🧩 Component Hierarchy & UI System

The client is built using a clean hierarchical structure with dedicated layout shells, protected routes, and custom interactive visualization modules:

```mermaid
graph TD
    App["App.tsx (Root Application Shell)"]
    EB["ErrorBoundary (Fail-safe Fallback UI)"]
    TP["ThemeProvider (Sleek Obsidian Theme)"]
    Router["BrowserRouter"]
    Shell["AppShell (Responsive Layout & Nav)"]
    Sidebar["Sidebar Component (Nav Links + Profile + Logout)"]
    Guard["Route Guards (ProtectedRoute & GuestRoute)"]

    App --> EB --> TP --> Router --> Shell
    Shell --> Sidebar
    Shell --> Guard

    subgraph Pages["Application Pages"]
        Login["/login · Login (Email Magic, Firebase, Google, Supabase)"]
        Upload["/upload · UploadResume (Dropzone, Text Extraction, Analysis Trigger)"]
        Dashboard["/dashboard · Dashboard (Readiness Score, Skill Cloud, Quick Metrics)"]
        ResumeResult["/result · ResumeResult (Full Breakdown, Extracted Skills, Raw Data)"]
        SkillsGap["/skills-gap · SkillsGap (Missing Stack, Priorities, Remediation)"]
        CareerPath["/career-path · CareerPath (Role Match Matrix, Salary Tiers)"]
        ATSCheck["/ats-check · ATSCheck (Interactive 5-Pillar Audit & Checklist)"]
        History["/history · History (Chronological Audits & Comparative Delta Diff)"]
        Profile["/profile · Profile (User Profile, Session Info, Account Security)"]
    end

    Guard --> Pages

    subgraph VisualComponents["Interactive Custom Visualizations"]
        ATSSphere["ATSSphere (Canvas-based 3D Particle Sphere)"]
        RoleMatchCard["RoleMatchCard (Job benchmark match & salary gauges)"]
        KeycapOrb["KeycapOrb (3D Tactile Orb Animation)"]
        BreakdownRadar["ScoreBreakdown Radar & Category Radial"]
        HistoryDiff["Comparative Delta Visualizer (+/- Gain)"]
    end

    ATSCheck --> ATSSphere
    CareerPath --> RoleMatchCard
    Login --> KeycapOrb
    Dashboard --> BreakdownRadar
    History --> HistoryDiff
```

---

## 🔄 End-to-End Data & Execution Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Browser
    participant React as React Client (Vite)
    participant NodeAPI as Node.js Gateway (:5000)
    participant PythonAI as Python AI Engine (:8000)
    participant DB as Supabase PostgreSQL

    Note over User,DB: Phase 1: Resume Upload & Analysis Flow
    User->>React: Pastes resume text or uploads .txt file
    React->>React: Validate content (50 to 50,000 characters)
    React->>NodeAPI: POST /api/upload-resume (Authorization: Bearer <JWT>)
    NodeAPI->>NodeAPI: Verify JWT signature & rate limiter (100 / 15m)
    NodeAPI->>PythonAI: POST /analyze (X-Internal-Secret: <SECRET>)
    PythonAI->>PythonAI: Deterministic NLP extraction & skill matching
    PythonAI->>PythonAI: Compute readiness score, gap skills, career paths & roadmap
    PythonAI-->>NodeAPI: 200 OK (Clean analysis JSON)
    NodeAPI->>DB: INSERT into analyses (user_id, email, skills, JSONB metrics)
    DB-->>NodeAPI: Saved record (id: UUID)
    NodeAPI-->>React: 200 OK ({ ...aiData, id: UUID })
    React->>React: Store in localStorage + Zustand & navigate to /dashboard

    Note over User,DB: Phase 2: ATS 5-Pillar Verification Flow
    User->>React: Navigates to /ats-check & inputs Target Role
    React->>NodeAPI: POST /api/ats-check { resume: text, target_role: string }
    NodeAPI->>PythonAI: POST /ats-check (X-Internal-Secret)
    PythonAI->>PythonAI: Execute formatting, section, date, keyword & integrity tests
    PythonAI-->>NodeAPI: 200 OK ({ ats_score, grade, checks, tips })
    NodeAPI-->>React: 200 OK
    React->>User: Render ATSSphere, score dial, checklist & keyword gaps
```

---

## 🔐 Multi-Provider Authentication & Token Rotation

Futrix AI supports multi-channel identity verification (Email Magic Link, Google Identity Services, Firebase Admin, and Supabase OAuth), followed by issuance of short-lived access JWTs and rolling refresh tokens stored in PostgreSQL.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Client as React Client
    participant API as Node Gateway
    participant AuthProvider as Firebase / Google / Supabase
    participant DB as Supabase DB

    User->>Client: Sign in (Email, Firebase, Google, or Supabase)
    Client->>AuthProvider: Authenticate & receive credential token
    AuthProvider-->>Client: Provider Token (idToken / accessToken)
    Client->>API: POST /api/auth/firebase (or /supabase, /google, /login)
    API->>AuthProvider: Verify cryptographic signature
    AuthProvider-->>API: Verified User Profile (email, uid, avatar)
    API->>DB: Find or create user record (users table)
    API->>API: Generate Access Token (15m) & Refresh Token (7d)
    API->>DB: Store hashed refresh token in refresh_tokens table
    API-->>Client: { accessToken, refreshToken, user }
    Client->>Client: Cache in localStorage & Zustand store

    Note over Client,DB: Automatic Rolling Token Refresh
    Client->>API: API Request with expired Access Token
    API-->>Client: 401 Unauthorized
    Client->>API: POST /api/auth/refresh { refreshToken }
    API->>DB: Check if token exists and is NOT revoked
    API->>DB: Revoke old token (Token Invalidation)
    API->>API: Generate new token pair
    API->>DB: Persist new active refresh token
    API-->>Client: { accessToken: new, refreshToken: new }
    Client->>API: Retry original request seamlessly
```

---

## 🧠 Deterministic AI Engine & 5-Pillar ATS Heuristics

Unlike non-deterministic LLMs that frequently hallucinate skills or output inconsistent scores, Futrix AI uses a **deterministic, rule-grounded NLP engine**:

1. **Skill Taxonomy & Verification**: Matches exact word boundaries and aliases against `skills_db.json` across 40+ technology categories (Languages, Frameworks, Cloud, Databases, DevOps, Data Science, Architecture).
2. **5-Pillar ATS Audit Engine**:
   - **Formatting Risk**: Flags tables, special symbols, multiple consecutive whitespace, and non-ASCII anomalies.
   - **Section Completeness**: Assesses presence of critical resume sections (`Experience`, `Education`, `Skills`, `Projects`, `Summary`).
   - **Date Parseability**: Detects chronologies, standard month/year formats, and career gaps.
   - **Keyword Alignment**: Cross-matches resume content against target role keywords and highlights missing terminology.
   - **File Integrity & Density**: Audits character count, word density, and bullet point distribution.

---

## 🗂️ Project Directory Structure

```
Futrix-Ai/
├── client/                                 # React 18 + TypeScript + Vite Client
│   ├── src/
│   │   ├── components/                     # Reusable UI widgets & layouts
│   │   │   ├── charts/
│   │   │   │   └── ATSSphere.tsx           # Interactive 3D Canvas ATS particle sphere
│   │   │   ├── ui/                         # Modern tactile UI components (KeycapOrb, etc.)
│   │   │   ├── RoleMatchCard.tsx           # Career path matching card
│   │   │   ├── ScoreRing.tsx               # Circular readiness score indicator
│   │   │   └── Sidebar.tsx                 # Navigation bar with responsive mobile drawer
│   │   ├── config/                         # Theme definitions & configuration
│   │   ├── pages/                          # Primary view routes
│   │   │   ├── ATSCheck.tsx                # ATS 5-pillar heuristic checker
│   │   │   ├── CareerPath.tsx              # Role matching & salary projection
│   │   │   ├── Dashboard.tsx               # Overview dashboard & quick actions
│   │   │   ├── History.tsx                 # Historical audit records & comparative delta
│   │   │   ├── Login.tsx                   # Multi-provider login screen
│   │   │   ├── Profile.tsx                 # User profile & account preferences
│   │   │   ├── ResumeResult.tsx            # Deep-dive analysis view
│   │   │   ├── SkillsGap.tsx               # Skill gap analysis & prioritized roadmap
│   │   │   └── UploadResume.tsx            # Dropzone & resume submission page
│   │   ├── services/                       # API integration layer
│   │   │   ├── apiService.ts               # Primary resilient HTTP client with auto-refresh
│   │   │   ├── api.ts                      # Axios service instance
│   │   │   ├── firebase.ts                 # Firebase client SDK initialization
│   │   │   ├── supabase.ts                 # Supabase client SDK initialization
│   │   │   └── resumeParser.ts             # Client-side text parsing & validation
│   │   ├── store/                          # Zustand state stores
│   │   │   ├── useAuth.ts                  # Authentication & session store
│   │   │   ├── useResume.ts                # Active analysis result store
│   │   │   └── useErrorStore.ts            # Global error notification state
│   │   └── styles/                         # Modular CSS styles
│   ├── vite.config.ts                      # Vite build configuration & dev proxy error handler
│   └── package.json
│
├── node-api/                               # Express Gateway & BFF (Node.js)
│   ├── db/
│   │   ├── supabaseClient.js               # Supabase PostgreSQL client connection pool
│   │   ├── userRepo.js                     # User entity database operations
│   │   ├── analysisRepo.js                 # Analysis entity database operations
│   │   └── refreshTokenRepo.js             # Token persistence & rotation repository
│   ├── middleware/
│   │   ├── auth.js                         # JWT Bearer token verification middleware
│   │   └── rateLimiter.js                  # Sliding-window rate limiting
│   ├── routes/
│   │   └── userRoutes.js                   # Application route handlers (Auth, Resume, ATS, Jobs)
│   ├── utils/
│   │   ├── authUtils.js                    # JWT signing & verification helpers
│   │   ├── firebaseAdmin.js                # Firebase Admin SDK initialization
│   │   └── serviceWarmer.js                # Cold-start keep-alive warmer
│   ├── tests/
│   │   └── test-db-integration.js          # 31-point comprehensive integration test suite
│   ├── server.js                           # Express entry point & middleware orchestrator
│   └── package.json
│
├── python-ai/                              # Deterministic NLP Microservice (FastAPI)
│   ├── tests/
│   │   ├── test_ats.py                     # ATS heuristic unit & property test suite
│   │   └── test_skills.py                  # NLP skill extraction test suite
│   ├── ai_engine.py                        # Core NLP extraction, scoring, & ATS algorithm
│   ├── skills_db.json                      # 40+ technology taxonomy & benchmark skills
│   ├── main.py                             # FastAPI endpoints & internal auth verification
│   └── requirements.txt                    # Python dependencies (FastAPI, Uvicorn, Pydantic)
│
├── docs/                                   # Project documentation & architectural blueprints
│   ├── DEPLOYMENT_GUIDE.md                 # Production deployment runbook
│   ├── FUTRIX_AI_MASTER_SPECIFICATION.md   # Complete system specification
│   └── MIGRATION.md                        # Database migration & schema history
├── package.json                            # Monorepo root scripts (dev, test, lint)
└── README.md
```

---

## 🔌 API Endpoint Reference

### Gateway API (`node-api`) — Port `5000` (Public / BFF)

| Method | Endpoint | Auth | Rate Limit | Description |
|:------:|:---------|:----:|:----------:|:------------|
| `GET` | `/health` | Public | — | Health probe, uptime, DB connectivity status |
| `POST` | `/api/login` | Public | 10 / 15m | Passwordless / email magic login & token issuance |
| `POST` | `/api/auth/firebase` | Public | 20 / 15m | Verify Firebase ID token & issue JWT pair |
| `POST` | `/api/auth/supabase` | Public | 20 / 15m | Verify Supabase access token & issue JWT pair |
| `POST` | `/api/auth/google` | Public | 20 / 15m | Verify Google OAuth2 / GIS credential |
| `POST` | `/api/auth/refresh` | Public | — | Rotate refresh token (revokes old token) |
| `POST` | `/api/auth/logout` | Bearer JWT | — | Invalidate all refresh tokens for current user |
| `GET` | `/api/auth/verify` | Bearer JWT | — | Verify access token validity and return user details |
| `GET` | `/api/profile` | Bearer JWT | — | Fetch authenticated user's profile |
| `PUT` | `/api/profile` | Bearer JWT | — | Update profile name and avatar |
| `POST` | `/api/upload-resume` | Bearer JWT | 100 / 15m | Analyze resume via Python AI and persist results |
| `GET` | `/api/history` | Bearer JWT | — | Fetch user's analysis history (scoped by email) |
| `GET` | `/api/compare` | Bearer JWT | — | Compare two analyses by `?id1=&id2=` with IDOR check |
| `POST` | `/api/jobs/match` | Bearer JWT | — | Rank target job roles against detected skills |
| `POST` | `/api/ats-check` | Bearer JWT | — | Run 5-pillar ATS heuristic check on resume text |

### Python AI Engine (`python-ai`) — Port `8000` (Internal Service)

> Protected via `X-Internal-Secret` header matching `INTERNAL_API_SECRET`.

| Method | Endpoint | Description |
|:------:|:---------|:------------|
| `GET` | `/health` | Microservice liveness probe |
| `POST` | `/analyze` | Deterministic NLP skill extraction, readiness score, and roadmap |
| `POST` | `/ats-check` | 5-pillar ATS heuristic audit (formatting, sections, dates, keywords, integrity) |
| `POST` | `/score-breakdown`| Granular category score breakdown calculation |
| `POST` | `/career-path` | Benchmark comparison against career catalog |
| `POST` | `/compare` | Comparative diff between two resume payloads |

---

## 🗃️ Database Entity-Relationship Model

```mermaid
erDiagram
    USERS ||--o{ ANALYSES : owns
    USERS ||--o{ REFRESH_TOKENS : issues

    USERS {
        uuid id PK "gen_random_uuid()"
        text email UK "Unique user email"
        text name "Display name"
        text auth_provider "'email' | 'firebase' | 'supabase' | 'google'"
        text firebase_uid "External Provider UID"
        text google_id "Google OAuth Subject ID"
        text avatar "Avatar URL"
        int login_attempts "Failed attempt counter"
        timestamptz lock_until "Account lockout timestamp"
        timestamptz last_login "Last successful login"
        timestamptz created_at "Account creation timestamp"
        timestamptz updated_at "Record update timestamp"
    }

    ANALYSES {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "References USERS(id)"
        text email "User email for indexed querying"
        text resume_text "Raw sanitized input text"
        text[] skills "Detected technology skills"
        text[] gap_skills "Identified missing skills"
        numeric readiness_score "0 to 100 calculated score"
        text[] roadmap "Sequential recommended learning roadmap"
        jsonb score_breakdown "Category score breakdown metrics"
        jsonb career_paths "Matched career paths and percentages"
        jsonb skill_weights "Normalized individual skill weights"
        jsonb category_distribution "Category distribution breakdown"
        jsonb readiness_trajectory "Growth projections"
        timestamptz created_at "Analysis timestamp"
        timestamptz updated_at "Record update timestamp"
    }

    REFRESH_TOKENS {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "References USERS(id)"
        text token_hash "SHA-256 hash of refresh token"
        timestamptz expires_at "Token expiration timestamp (7 days)"
        timestamptz revoked_at "Token revocation timestamp (rotation)"
        timestamptz created_at "Creation timestamp"
    }
```

---

## 🚀 Local Development & Testing

### Prerequisites
- **Node.js** v18+ (tested on Node v22)
- **Python** v3.11+ (tested on Python 3.14)
- **Supabase** instance (or active development credentials)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/kirtan597/Futrix-Ai.git
cd Futrix-Ai

# Install root dependencies
npm install

# Install all sub-project dependencies
npm run install:all

# Install Python microservice requirements
cd python-ai && pip install -r requirements.txt && cd ..
```

### 2. Environment Configuration

Create `.env` files in `node-api/`, `client/`, and `python-ai/`:

```bash
# Node API: node-api/.env
PORT=5000
NODE_ENV=development
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_at_least_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_at_least_32_chars
INTERNAL_API_SECRET=shared_secret_between_node_and_python
PYTHON_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# Python AI: python-ai/.env
INTERNAL_API_SECRET=shared_secret_between_node_and_python
ALLOWED_ORIGINS=http://localhost:5000,http://localhost:5173

# Client: client/.env
VITE_API_URL=http://localhost:5000
```

### 3. Running Services Concurrently

Run all three tiers with a single command:

```bash
npm run dev
```

| Service | Port | Local URL |
|:--------|:----:|:----------|
| **React Client (Vite)** | `5173` | [http://localhost:5173](http://localhost:5173) |
| **Node API Gateway** | `5000` | [http://localhost:5000/health](http://localhost:5000/health) |
| **Python AI Engine** | `8000` | [http://localhost:8000/health](http://localhost:8000/health) |

### 4. Running Verification Test Suites

```bash
# Run all automated test suites
npm test

# Or run tests individually per service:
npm run test:python   # 74 pytest assertions (NLP + ATS heuristics)
npm run test:node     # 31 Node.js integration assertions (DB + Auth + IDOR)
npm run test:client   # TypeScript compilation + Vite production bundle + ESLint
```

---

## ☁️ Production Deployment

Futrix AI is optimized for cloud deployment across Render, Netlify, and Supabase:

- **Frontend Client**: Deployed to Netlify / Vercel with SPA routing rewrites.
- **Node Gateway**: Deployed as a Web Service on Render (Docker / Node 18+).
- **Python AI Microservice**: Deployed as a Web Service on Render (Docker / Python 3.11+).
- **Database**: Managed Supabase PostgreSQL with automated daily backups.

Refer to [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) for step-by-step production setup and DNS routing.

---

## 🔒 Security Model & Rate Limiting

- **Zero-Trust Hop-by-Hop Authentication**: Client communicates strictly via signed JWT Bearer tokens. Internal calls from Node Gateway to Python AI require `X-Internal-Secret`.
- **Anti-IDOR Isolation**: Analysis lookups and comparison endpoints enforce cryptographic identity verification (`req.user.email === analysis.email`).
- **Account Brute-Force Protection**: 5 consecutive failed login attempts trigger an automated account lock for 15 minutes.
- **Sliding-Window Rate Limiting**: In-memory rate limiting throttles abuse on public authentication endpoints.
- **Strict Content Security**: Cross-Origin-Opener-Policy (`same-origin-allow-popups`) and strict origin whitelisting prevent unauthorized cross-origin embeddings.

---

<div align="center">

**Built with precision by [Kirtan](https://github.com/kirtan597)**

*Futrix AI · Autonomous Career Intelligence*

</div>
