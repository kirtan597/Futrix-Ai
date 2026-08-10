<div align="center">

# 🚀 Futrix AI - Career Twin

### AI-Powered Career Intelligence Platform

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-futrixai.netlify.app-00C7B7?style=for-the-badge)](https://futrixai.netlify.app)
[![GitHub](https://img.shields.io/badge/GitHub-kirtan597/Futrix--Ai-181717?style=for-the-badge&logo=github)](https://github.com/kirtan597/Futrix-Ai)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Transform your resume into actionable career insights with AI-powered analysis**

[🎯 Try Live Demo](https://futrixai.netlify.app) • [📖 Documentation](#documentation) • [🛠️ Tech Stack](#tech-stack) • [🚀 Deploy](#deployment)

</div>

---

## ✨ What is Futrix AI?

Futrix AI Career Twin is an intelligent career analysis platform that combines **Natural Language Processing**, **Machine Learning**, and **Interactive Visualizations** to provide comprehensive career insights. Upload your resume and get instant analysis of your skills, role matches, career paths, and personalized recommendations.

---

## 🎯 Key Features

<table>
<tr>
<td width="50%">

### 🔐 Secure Authentication
- **Google OAuth 2.0** integration
- **Email Magic Links** authentication
- JWT token management with auto-refresh
- Session persistence

</td>
<td width="50%">

### 🤖 AI-Powered Analysis
- Resume parsing (PDF & Text)
- **160+ technical skills** detection
- Experience level extraction
- Industry-standard NLP algorithms

</td>
</tr>
<tr>
<td width="50%">

### 🎯 Smart Role Matching
- Match against **7 tech positions**
- Percentage-based scoring
- Salary range estimation
- Skills gap identification

</td>
<td width="50%">

### 📊 Interactive Visualizations
- Animated score ring
- Skills radar chart (6 categories)
- Career path timeline
- Real-time data updates

</td>
</tr>
<tr>
<td width="50%">

### 🛣️ Career Intelligence
- Personalized roadmap
- Skills progression path
- Learning recommendations
- Industry insights

</td>
<td width="50%">

### ⚡ Performance & Security
- Rate limiting protection
- CORS security
- Cloud-native deployment
- Auto-scaling infrastructure

</td>
</tr>
</table>

---

## 🌐 Live Production URLs

| Service | URL | Status |
|---------|-----|--------|
| 🎨 **Frontend** | [futrixai.netlify.app](https://futrixai.netlify.app) | ![Status](https://img.shields.io/badge/status-live-brightgreen) |
| 🔧 **Node API** | [futrix-node-api.onrender.com](https://futrix-node-api.onrender.com) | ![Status](https://img.shields.io/badge/status-live-brightgreen) |
| 🧠 **Python AI** | [futrix-python-ai.onrender.com](https://futrix-python-ai.onrender.com) | ![Status](https://img.shields.io/badge/status-live-brightgreen) |
| 💾 **Database** | MongoDB Atlas | ![Status](https://img.shields.io/badge/status-connected-brightgreen) |

---

## 🏗️ Architecture Overview

<div align="center">

### System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App<br/>Netlify]
    end
    
    subgraph "API Layer"
        B[Node.js API<br/>Express + JWT<br/>Render]
    end
    
    subgraph "AI Layer"
        C[Python AI Engine<br/>FastAPI + NLP<br/>Render]
    end
    
    subgraph "Data Layer"
        D[(MongoDB Atlas<br/>Cloud Database)]
    end
    
    subgraph "Authentication"
        E[Google OAuth 2.0]
    end
    
    A -->|REST API<br/>Bearer Token| B
    B -->|AI Analysis<br/>Requests| C
    B -->|Store/Retrieve<br/>Data| D
    A -->|OAuth Flow| E
    B -->|Verify Token| E
    
    style A fill:#00C7B7,stroke:#00A89C,stroke-width:3px,color:#fff
    style B fill:#0288D1,stroke:#01579B,stroke-width:3px,color:#fff
    style C fill:#7B1FA2,stroke:#4A148C,stroke-width:3px,color:#fff
    style D fill:#388E3C,stroke:#1B5E20,stroke-width:3px,color:#fff
    style E fill:#F57C00,stroke:#E65100,stroke-width:3px,color:#fff
```

</div>

---

## 🔄 User Flow Diagrams

### Resume Analysis Workflow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant NodeAPI as Node API
    participant PythonAI as Python AI
    participant MongoDB
    
    User->>Frontend: 1. Upload Resume/Paste Text
    Frontend->>Frontend: 2. Validate Input (min 50 chars)
    Frontend->>NodeAPI: 3. POST /api/upload-resume + JWT
    NodeAPI->>NodeAPI: 4. Verify Token & Rate Limit
    NodeAPI->>PythonAI: 5. POST /analyze (resume text)
    PythonAI->>PythonAI: 6. NLP Processing<br/>Skill Extraction (160+ skills)<br/>Score Calculation
    PythonAI-->>NodeAPI: 7. Return Analysis<br/>(skills, gaps, roles, score)
    NodeAPI->>MongoDB: 8. Save Analysis Document
    MongoDB-->>NodeAPI: 9. Confirm Save
    NodeAPI-->>Frontend: 10. Analysis Results + ID
    Frontend->>Frontend: 11. Render Visualizations<br/>(Charts, Cards, Timeline)
    Frontend-->>User: 12. Display Dashboard<br/>with Insights
    
    Note over PythonAI: Deterministic Analysis<br/>No LLM calls<br/>Fast & Reliable
```

### Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Google
    participant NodeAPI as Node API
    participant MongoDB
    
    rect rgb(200, 230, 255)
    Note over User,MongoDB: Google OAuth Flow
    User->>Frontend: 1. Click "Sign in with Google"
    Frontend->>Google: 2. Open OAuth Popup
    Google-->>Frontend: 3. Return Credential Token
    Frontend->>NodeAPI: 4. POST /api/auth/google<br/>(credential)
    end
    
    NodeAPI->>Google: 5. Verify Token
    Google-->>NodeAPI: 6. User Info (email, name)
    
    NodeAPI->>MongoDB: 7. Create/Update User
    NodeAPI->>NodeAPI: 8. Generate JWT Tokens<br/>(access: 15m, refresh: 7d)
    NodeAPI->>MongoDB: 9. Store Refresh Token
    
    NodeAPI-->>Frontend: 10. Return Tokens + User Data
    Frontend->>Frontend: 11. Store Tokens (localStorage)
    Frontend-->>User: 12. Redirect to Dashboard
    
    rect rgb(255, 230, 200)
    Note over User,MongoDB: Token Refresh Flow
    Frontend->>NodeAPI: 13. POST /api/auth/refresh<br/>(refreshToken)
    NodeAPI->>MongoDB: 14. Validate Refresh Token
    NodeAPI->>NodeAPI: 15. Generate New Tokens
    NodeAPI-->>Frontend: 16. New Access + Refresh Tokens
    end
```

---

## 1) What this project actually is

Futrix AI is a **monorepo** with three active runtime services:

1. **Frontend (`client/`)** - React + TypeScript app (Vite + MUI)
2. **Node API (`node-api/`)** - Express API for auth, persistence, and orchestration
3. **Python AI (`python-ai/`)** - FastAPI engine for resume analysis logic

There is also a **legacy Java gateway (`java-gateway/`)** included in the repo and in Docker compose, but the current primary auth + API flow is Node-based.

---

## 2) High-level architecture (visual)

```mermaid
flowchart LR
    A[React Frontend<br/>Vite :5173] -->|/api/*| B[Node API<br/>Express :5000]
    B -->|/analyze, /compare| C[Python AI<br/>FastAPI :8000]
    B --> D[(MongoDB)]
    A -->|Google OAuth client| E[Google Identity Services]
```

### Runtime responsibilities

- **Frontend**: login UX, resume upload/paste, dashboards/charts, route protection
- **Node API**: JWT auth, Google token verification, refresh rotation, rate limiting, stores analysis history
- **Python AI**: deterministic skill detection against a skills database, scoring, gap logic, role matching

---

## 3) Feature flow (visual + practical)

### Resume analysis flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Node API
    participant AI as Python AI
    participant DB as MongoDB

    U->>FE: Paste text or upload .txt
    FE->>API: POST /api/upload-resume (JWT)
    API->>AI: POST /analyze
    AI-->>API: skills, gaps, score, roadmap, career_paths
    API->>DB: Save analysis document
    API-->>FE: Analysis payload + _id
    FE-->>U: Dashboard + charts + roadmap
```

### Auth flow

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Node API
    participant G as Google
    participant DB as MongoDB

    U->>FE: Login via email or Google
    FE->>G: Google popup (if Google login)
    FE->>API: POST /api/auth/google or /api/login
    API->>DB: Create/update user + store refresh token
    API-->>FE: accessToken (15m) + refreshToken (7d)
    FE->>API: Protected requests with Bearer token
    FE->>API: POST /api/auth/refresh on expiry
```

---

## 4) Core analysis behavior (from current code)

### Deterministic extraction
- Uses `python-ai/skills_db.json` with **170 known skills**.
- No LLM calls in the analysis pipeline.
- Boundary-aware matching for ambiguous short skills like `Go`, `AI`, `R`, `C`, `C#`, `C++`, `SQL`.

### Scoring logic
- Base score from number of detected skills
- Penalty from number of gaps
- Score clamped to valid range
- Additional score breakdown dimensions:
  - skill_match
  - stack_balance
  - cloud_presence
  - devops_score
  - language_div

### Gap and roadmap logic
- Gap suggestions are context-aware (frontend/backend/devops/cloud/ml domains).
- Roadmap is generated from actual identified gaps, plus portfolio/interview prompts when enough skills exist.

---

## 5) UI/UX behavior users get

### Key pages
- `/login` - Google OAuth + email login
- `/upload` - Paste resume text or upload `.txt`
- `/dashboard` - score summary and visual metrics
- `/result` - detailed report
- `/skills-gap` - missing skills visualization
- `/career-path` - role match mapping
- `/history` - saved analysis history
- `/profile` - user profile view

### Upload behavior
- Supports:
  - manual text paste
  - drag-and-drop `.txt`
  - file picker upload `.txt`
- Enforces minimum content threshold (50 chars) before analysis.

---

## 📡 API Reference

### 🔐 Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/login` | ❌ | Email magic link login |
| `POST` | `/api/auth/google` | ❌ | Google OAuth verification |
| `POST` | `/api/auth/refresh` | ❌ | Refresh access token |
| `POST` | `/api/auth/logout` | ❌ | Invalidate refresh token |
| `GET` | `/api/auth/verify` | ✅ | Verify token & get user |

### 📊 Analysis Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/api/upload-resume` | ✅ | Analyze resume and save |
| `GET` | `/api/history` | ✅ | Fetch user's analyses |
| `GET` | `/api/compare` | ✅ | Compare two analyses |
| `POST` | `/api/jobs/match` | ✅ | Match roles from skills |

### 🏥 System Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/health` | ❌ | API health check |

### 🧠 Python AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Engine status |
| `GET` | `/health` | Health check |
| `POST` | `/analyze` | Full resume analysis |
| `POST` | `/score-breakdown` | Score components |
| `POST` | `/career-path` | Role mapping |
| `POST` | `/compare` | Compare resumes |

---

## 🔒 Security Features

<table>
<tr>
<td width="50%">

### 🛡️ Authentication Security
- **JWT Tokens**: Access (15min) + Refresh (7days)
- **Token Rotation**: Automatic refresh rotation
- **Secure Storage**: Refresh tokens in MongoDB
- **Google OAuth 2.0**: Industry-standard auth
- **Session Management**: Automatic token cleanup

</td>
<td width="50%">

### ⚡ Performance & Protection
- **Rate Limiting**: 
  - 10 logins per 15 minutes
  - 5 uploads per hour
- **CORS Protection**: Whitelist configuration
- **Input Validation**: Server-side validation
- **Environment Security**: Secrets management
- **MongoDB Encryption**: Connection encryption

</td>
</tr>
</table>

---

## 6) API surface (current)

### Node API (`/api`)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/login` | No | Email login |
| POST | `/auth/google` | No | Google credential verification |
| POST | `/auth/refresh` | No | Refresh token rotation |
| POST | `/auth/logout` | No | Invalidate stored refresh token |
| GET | `/auth/verify` | Yes | Verify access token + return user |
| POST | `/upload-resume` | Yes | Analyze and save resume |
| GET | `/history` | Yes | Fetch recent analyses |
| GET | `/compare?id1=&id2=` | Yes | Compare two analysis entries |
| POST | `/jobs/match` | Yes | Role matching from skill list |
| GET | `/health` | No | Service health |

### Python AI

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | engine status |
| GET | `/health` | health |
| POST | `/analyze` | full analysis |
| POST | `/score-breakdown` | score components |
| POST | `/career-path` | role mapping |
| POST | `/compare` | compare two resumes |

---

## 7) Repository structure

```text
career-twin-ai/
├─ client/                 # React + TypeScript frontend
│  ├─ src/
│  │  ├─ pages/
│  │  ├─ components/
│  │  ├─ services/
│  │  └─ store/
│  ├─ vite.config.ts
│  ├─ netlify.toml
│  └─ vercel.json
├─ node-api/               # Express API + Mongo models
│  ├─ routes/userRoutes.js
│  ├─ middleware/
│  ├─ models/
│  ├─ utils/
│  ├─ server.js
│  └─ render.yaml
├─ python-ai/              # FastAPI analysis engine
│  ├─ main.py
│  ├─ ai_engine.py
│  ├─ skills_db.json
│  └─ render.yaml
├─ java-gateway/           # legacy Java servlet gateway (optional)
├─ docker-compose.yml
├─ run-dev.bat
└─ render.yaml
```

---

## 🚀 Quick Start

### Prerequisites

```bash
✓ Node.js 18+ and npm
✓ Python 3.11+
✓ MongoDB (local or Atlas)
✓ Google OAuth credentials (optional)
```

### 🎯 One-Command Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/kirtan597/Futrix-Ai.git
cd Futrix-Ai

# Install all dependencies and start all services
npm install
npm run dev
```

**That's it!** 🎉 The application will start:
- 🎨 Frontend: http://localhost:5173
- 🔧 Node API: http://localhost:5000
- 🧠 Python AI: http://localhost:8000

---

### 🪟 Windows Quick Start

```bat
# Double-click or run:
run-dev.bat
```

This will:
1. Open separate terminals for each service
2. Install dependencies automatically
3. Launch your default browser

---

### 🐳 Docker Setup

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## ⚙️ Configuration

### Environment Variables

#### 🔧 Node API (`node-api/.env`)

```env
# Database
MONGO_URI=mongodb://localhost:27017/futrixai
# or MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/futrixai

# Server
PORT=5000
NODE_ENV=development

# Services
PYTHON_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# JWT Secrets (generate secure random strings)
JWT_SECRET=your_jwt_secret_here_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### 🎨 Frontend (`client/.env`)

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000
```

### 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID** credentials
5. Add authorized JavaScript origins:
   ```
   http://localhost:5173
   https://futrixai.netlify.app
   ```
6. Add authorized redirect URIs:
   ```
   http://localhost:5173
   https://futrixai.netlify.app
   ```
7. Copy Client ID and Secret to `.env` files

---

## 8) Local development (practical runbook)

## Prerequisites
1. Node.js 18+
2. Python 3.11+
3. MongoDB (local or Atlas)

## Option A - one command from root

```bash
npm install
npm run dev
```

This runs:
- Python AI on `http://localhost:8000`
- Node API on `http://localhost:5000`
- React frontend on `http://localhost:5173`

## Option B - Windows helper script

```bat
run-dev.bat
```

Opens separate terminals for all services and browser.

## Option C - start services manually

```bash
# terminal 1
cd python-ai
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# terminal 2
cd node-api
npm install
node server.js

# terminal 3
cd client
npm install
npm run dev
```

---

## 9) Environment variables

### `node-api/.env`

```env
MONGO_URI=mongodb://localhost:27017/futrixai
PORT=5000
NODE_ENV=development
PYTHON_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=replace_with_secure_value
JWT_REFRESH_SECRET=replace_with_secure_value
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### `client/.env`

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Deployment

### 🌐 Current Production Deployment

All services are deployed and live:

```mermaid
graph LR
    A[GitHub Repo] -->|Auto Deploy| B[Netlify]
    A -->|Auto Deploy| C[Render - Node API]
    A -->|Auto Deploy| D[Render - Python AI]
    C -->|Connect| E[(MongoDB Atlas)]
    
    style B fill:#00C7B7
    style C fill:#46E3B7
    style D fill:#46E3B7
    style E fill:#4DB33D
```

### 📍 Production URLs

- **Frontend**: https://futrixai.netlify.app (Netlify)
- **Node API**: https://futrix-node-api.onrender.com (Render)
- **Python AI**: https://futrix-python-ai.onrender.com (Render)
- **Database**: MongoDB Atlas (Cloud)

### 🎯 Deploy Your Own Instance

<details>
<summary><b>📘 Deploy to Netlify (Frontend)</b></summary>

1. Fork this repository
2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your fork
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
   - **Base directory**: `client`
6. Add environment variables:
   ```
   VITE_GOOGLE_CLIENT_ID=your_client_id
   VITE_API_URL=https://your-api.onrender.com
   ```
7. Deploy! 🚀

</details>

<details>
<summary><b>🟢 Deploy to Render (Backend)</b></summary>

#### Node API

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `futrix-node-api`
   - **Root Directory**: `node-api`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add environment variables (see Configuration section)
6. Deploy!

#### Python AI

1. Click "New" → "Web Service"
2. Connect repository
3. Configure:
   - **Name**: `futrix-python-ai`
   - **Root Directory**: `python-ai`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy!

</details>

<details>
<summary><b>🍃 Setup MongoDB Atlas (Database)</b></summary>

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free cluster
3. Create database user (username + password)
4. **Network Access**: Add `0.0.0.0/0` (allow all IPs for Render)
5. Get connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/futrixai
   ```
6. Add to Node API environment variables as `MONGO_URI`

</details>

### 📋 Deployment Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Google OAuth credentials obtained
- [ ] Python AI service deployed to Render
- [ ] Node API service deployed to Render (with all env vars)
- [ ] Frontend deployed to Netlify (with API URL)
- [ ] Google OAuth origins updated with production URLs
- [ ] Test production endpoints
- [ ] Monitor logs for errors

**📖 Detailed Guide**: See [DEPLOY_TO_RENDER.md](DEPLOY_TO_RENDER.md)

---

## 🧪 Testing

### Run Production Tests

```bash
# Node.js test suite (52 tests)
node test-production.mjs

# PowerShell test suite (Windows)
.\run-prod-tests.ps1
```

### Test Coverage

- ✅ Backend health checks
- ✅ Python AI health checks
- ✅ Authentication flows (Email + Google)
- ✅ Token management (generation, refresh, rotation)
- ✅ Protected routes authorization
- ✅ Input validation
- ✅ Rate limiting
- ✅ Job matching algorithm
- ✅ Logout and token invalidation
- ✅ CORS configuration

**Test Results**: 51/52 passing (1 test hits rate limit as expected)

---

## 🐛 Troubleshooting

<details>
<summary><b>🔴 Google OAuth 403 Error</b></summary>

**Problem**: "origin not allowed" error

**Solution**:
1. Go to Google Cloud Console
2. Navigate to your OAuth credentials
3. Add these to **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   http://127.0.0.1:5173
   https://your-production-url.com
   ```
4. Save and wait 5 minutes for propagation

</details>

<details>
<summary><b>⏰ Token "too far in future" Error</b></summary>

**Problem**: JWT validation fails with time error

**Solution**:
- Sync your system clock
- On Windows: Settings → Time & Language → Sync now
- On Mac: System Preferences → Date & Time → Set automatically
- On Linux: `sudo ntpdate -s time.nist.gov`

</details>

<details>
<summary><b>🐌 Slow API Response (30s delay)</b></summary>

**Problem**: First request takes ~30 seconds

**Solution**: This is normal for Render free tier
- Services spin down after 15 minutes of inactivity
- First request wakes up the service (cold start)
- Subsequent requests are fast (<1s)
- Upgrade to paid plan for always-on services

</details>

<details>
<summary><b>❌ MongoDB Connection Failed</b></summary>

**Problem**: Cannot connect to MongoDB

**Solution**:
1. Check MongoDB Atlas network access allows `0.0.0.0/0`
2. Verify connection string in `.env` is correct
3. Ensure database user credentials are valid
4. Check if IP whitelist includes your deployment IPs

</details>

<details>
<summary><b>🚫 CORS Error</b></summary>

**Problem**: Cross-origin request blocked

**Solution**:
1. Check `FRONTEND_URL` in Node API environment variables
2. Ensure frontend URL matches exactly (no trailing slash)
3. Verify CORS configuration in `node-api/server.js`
4. Clear browser cache and try again

</details>

<details>
<summary><b>🔧 Port Already in Use</b></summary>

**Problem**: `EADDRINUSE` error on port 5173, 5000, or 8000

**Solution**:
```bash
# Windows - Find and kill process
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux - Find and kill process
lsof -ti:5173 | xargs kill -9
```

</details>

---

## 📖 Documentation

<table>
<tr>
<td width="50%">

### 📚 Project Documentation
- [README.md](README.md) - This file
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Technical summary
- [SUBMISSION.txt](SUBMISSION.txt) - Formal submission
- [DEPLOY_TO_RENDER.md](DEPLOY_TO_RENDER.md) - Deployment guide

</td>
<td width="50%">

### 🔗 External Resources
- [React Documentation](https://react.dev)
- [Material-UI Docs](https://mui.com)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [MongoDB Atlas Guide](https://docs.atlas.mongodb.com)
- [Render Docs](https://render.com/docs)

</td>
</tr>
</table>

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📞 Support & Contact

<div align="center">

### Need Help?

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?style=for-the-badge&logo=github)](https://github.com/kirtan597/Futrix-Ai/issues)
[![Email](https://img.shields.io/badge/Email-Support-blue?style=for-the-badge&logo=gmail)](mailto:your-email@example.com)

**Found a bug?** [Open an issue](https://github.com/kirtan597/Futrix-Ai/issues)  
**Have a question?** [Start a discussion](https://github.com/kirtan597/Futrix-Ai/discussions)

</div>

---

## 📊 Project Stats

<div align="center">

![GitHub Stars](https://img.shields.io/github/stars/kirtan597/Futrix-Ai?style=social)
![GitHub Forks](https://img.shields.io/github/forks/kirtan597/Futrix-Ai?style=social)
![GitHub Watchers](https://img.shields.io/github/watchers/kirtan597/Futrix-Ai?style=social)

</div>

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Kirtan Patel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<div align="center">

### 🌟 Star this repository if you find it helpful!

**Made with ❤️ by [Kirtan Patel](https://github.com/kirtan597)**

[![Live Demo](https://img.shields.io/badge/🚀_Try_Live_Demo-futrixai.netlify.app-00C7B7?style=for-the-badge)](https://futrixai.netlify.app)

---

**[⬆ Back to Top](#-futrix-ai---career-twin)**

</div>

