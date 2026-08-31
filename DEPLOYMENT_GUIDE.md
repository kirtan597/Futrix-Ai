# 🚀 Futrix AI — Complete Production Deployment Guide

This guide provides step-by-step instructions to deploy **Futrix AI** to production using **Supabase (PostgreSQL)**, **Render (Node.js API & Python AI Engine)**, and **Netlify (React SPA Client)**.

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Netlify (Frontend Client)                       │
│                   https://futrixai.netlify.app                         │
│             React 18 + Vite + MUI + Pure SVG Visualizations            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (Bearer JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Render (Node.js Express Gateway)                    │
│                 https://futrix-node-api.onrender.com                   │
│       Auth, Session Rotation, Rate Limiter, Supabase Repository        │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ PostgREST / @supabase-js       │ Internal HTTP
                    ▼                                ▼
┌─────────────────────────────────────┐  ┌───────────────────────────────┐
│        Supabase (PostgreSQL)        │  │   Render (Python FastAPI)     │
│   users, tokens, analyses (JSONB)   │  │   Deterministic NLP / ATS     │
└─────────────────────────────────────┘  └───────────────────────────────┘
```

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have active accounts on:
1. **[Supabase](https://supabase.com/)** (Free Tier PostgreSQL)
2. **[Render](https://render.com/)** (Node.js & Python Web Services)
3. **[Netlify](https://www.netlify.com/)** (Static SPA Hosting)
4. **[Firebase Console](https://console.firebase.google.com/)** (Google Authentication)
5. **[GitHub](https://github.com/kirtan597/Futrix-Ai)** (Code Repository)

---

## 🗄️ Step 1: Set Up Supabase Database (PostgreSQL)

1. Log in to [Supabase](https://app.supabase.com/) and click **"New Project"**.
2. Set your **Project Name** (e.g., `futrix-ai-prod`) and choose a secure **Database Password**.
3. Once the database is provisioned, open the **SQL Editor** from the left sidebar.
4. Copy and execute the contents of [`supabase/migrations/20260831000000_initial_schema.sql`](file:///d:/Projects/Futrix-Ai/Futrix-Ai/supabase/migrations/20260831000000_initial_schema.sql):
   - Creates `public.users` table with auto-updated triggers.
   - Creates `public.refresh_tokens` table with cascading user deletes.
   - Creates `public.analyses` table with JSONB report indexing.
5. Navigate to **Project Settings** ➔ **API**:
   - Copy **Project URL** (e.g., `https://xyzproject.supabase.co`) ➔ `SUPABASE_URL`
   - Copy **service_role secret** ➔ `SUPABASE_SERVICE_ROLE_KEY` *(Never expose in client)*
   - Copy **anon public key** ➔ `SUPABASE_ANON_KEY`

### (Optional) Migrate Existing MongoDB Data to Supabase
If you have historical data in MongoDB Atlas, run the idempotent migration tool locally:
```bash
SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
MONGO_URI="mongodb+srv://user:pass@cluster.mongodb.net/futrixai" \
node node-api/scripts/migrate-to-supabase.js
```

---

## 🐍 Step 2: Deploy Python AI Engine to Render

1. Log in to [Render](https://dashboard.render.com/) and click **New +** ➔ **Web Service**.
2. Connect your GitHub repository: `kirtan597/Futrix-Ai`.
3. Configure the service settings:
   - **Name**: `futrix-python-ai`
   - **Region**: Closest to your users (e.g., `Oregon (US West)` or `Frankfurt`)
   - **Branch**: `main`
   - **Root Directory**: `python-ai`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.0` | Target Python version |
   | `PORT` | `10000` | Web port |
   | `INTERNAL_API_SECRET` | `generate_random_32_char_secret` | Internal shared secret |
   | `ALLOWED_ORIGINS` | `https://futrixai.netlify.app,https://futrix-node-api.onrender.com` | CORS whitelist |
5. Click **Create Web Service**. Wait for the build to complete and note your service URL:
   `https://futrix-python-ai.onrender.com`

---

## 🟢 Step 3: Deploy Node.js API Gateway to Render

1. On Render, click **New +** ➔ **Web Service**.
2. Select repository: `kirtan597/Futrix-Ai`.
3. Configure the service settings:
   - **Name**: `futrix-node-api`
   - **Region**: **Same region as Python AI engine** (for low latency)
   - **Branch**: `main`
   - **Root Directory**: `node-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Health Check Path**: `/health`
4. Add **Environment Variables**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Web port |
   | `SUPABASE_URL` | `https://your-project.supabase.co` | Supabase project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOi...` | Supabase service role secret |
   | `JWT_SECRET` | `generate_random_32_char_secret` | JWT access secret |
   | `JWT_REFRESH_SECRET` | `generate_random_32_char_secret` | JWT refresh secret |
   | `INTERNAL_API_SECRET` | `same_secret_as_python_ai` | Internal service auth |
   | `PYTHON_URL` | `https://futrix-python-ai.onrender.com` | Python AI service endpoint |
   | `FRONTEND_URL` | `https://futrixai.netlify.app` | Netlify frontend URL for CORS |
   | `FIREBASE_PROJECT_ID` | `futrix-ai` | Firebase project ID |
   | `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxx@...` | Firebase service account email |
   | `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` | Firebase private key (with escaped `\n`) |
5. Click **Create Web Service**. Note your API URL:
   `https://futrix-node-api.onrender.com`

---

## ⚛️ Step 4: Deploy React Client to Netlify

1. Log in to [Netlify](https://app.netlify.com/) and click **"Add new site"** ➔ **"Import an existing project"**.
2. Select GitHub and pick repository: `kirtan597/Futrix-Ai`.
3. Configure Build Settings:
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
4. Add **Environment Variables** in Netlify Dashboard (**Site configuration** ➔ **Environment variables**):
   | Key | Value |
   | :--- | :--- |
   | `NODE_VERSION` | `18` |
   | `VITE_API_URL` | `https://futrix-node-api.onrender.com` |
   | `VITE_GOOGLE_CLIENT_ID` | `your_google_oauth_client_id.apps.googleusercontent.com` |
5. Click **Deploy Site**.

---

## 🔍 Step 5: Post-Deployment Smoke Testing

Once all three services are live, verify the deployment:

### 1. Test Node API Health Check
```bash
curl -i https://futrix-node-api.onrender.com/health
```
*Expected Response (`200 OK`):*
```json
{
  "status": "ok",
  "database": "connected",
  "environment": "production",
  "version": "2.1.0",
  "services": {
    "auth": "operational",
    "analysis": "operational",
    "database": "operational",
    "python_ai": "operational"
  }
}
```

### 2. Test Python AI Engine Health Check
```bash
curl -i https://futrix-python-ai.onrender.com/health
```
*Expected Response (`200 OK`):*
```json
{
  "status": "ok"
}
```

### 3. Test Full User Journey on Frontend
1. Open your Netlify domain: `https://futrixai.netlify.app`.
2. Sign in with Google Popup or Email.
3. Paste a resume (min 50 characters) on `/upload` and click **Analyze Resume**.
4. Verify all visualizations populate instantly:
   - Dashboard: `ScoreArea`, `GapDonut`, `SkillRadar`.
   - Skills Gap: `SkillDistribution`, `PriorityMatrix`.
   - Career Path: `RoleComparisonChart`, `RoadmapFlow`.
   - ATS Checker: `ATSBalanceRadar`, `ATSPillarPerformance`, `ATSScoreRing`.
   - History: `PureSVGHistoryChart` and past analysis cards.

---

## 🛡️ Security & Performance Best Practices

- **Zero Client Database Exposure**: The Supabase service role key is strictly held in Render Node API backend environment variables. The client communicates exclusively through Bearer JWTs.
- **Single-Column SPA Routing**: `netlify.toml` automatically forwards all sub-routes to `/index.html` with status 200, ensuring no 404s on page refresh.
- **Cold Start Warmer**: `node-api/utils/serviceWarmer.js` automatically pings the Python AI engine every 14 minutes in production to prevent Render free-tier cold start delays.
- **Deterministic AI Inference**: All skill extractions and ATS audits execute deterministically with 0 hallucination risk and sub-second response latency.

---

<div align="center">
  <sub>Futrix AI is ready for production scale.</sub>
</div>
