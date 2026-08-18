# Futrix AI - Production Deployment Guide

## ✅ System Status: PRODUCTION READY

All services tested and working correctly. Resume upload generates AI analysis with proper error handling.

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- Python 3.10+

### Start 3 Services

```bash
# Terminal 1: Python AI (Port 8000)
cd python-ai
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2: Node API (Port 5000)
cd node-api
npm run dev

# Terminal 3: Frontend (Port 5173)
cd client
npm run dev
```

Visit: http://localhost:5173

## 🌐 Production Deployment

### Architecture Overview

Your system has **3 independent services**:
1. **Frontend** (Netlify) - React client
2. **Node API** (Render.com Web Service) - Express backend
3. **Python AI** (Render.com Web Service) - FastAPI analysis engine

### Frontend - Netlify
- Build: `npm run build` (from client/)
- Output: `client/dist`
- Env: `VITE_API_URL=https://futrix-node-api.onrender.com`

### Backend - Render.com (futrix-node-api)
- Build: `npm install` (from node-api/)
- Start: `node server.js`
- Health: GET `/health`
- Required Env vars:
  ```
  MONGO_URI=<mongodb-atlas-uri>
  JWT_SECRET=<random-secret>
  GOOGLE_CLIENT_ID=<from-google-oauth>
  GOOGLE_CLIENT_SECRET=<from-google-oauth>
  NODE_ENV=production
  FRONTEND_URL=https://futrixai.netlify.app
  PYTHON_URL=https://futrix-python-ai.onrender.com (auto-set by render.yaml)
  ```

### AI Engine - Render.com (futrix-python-ai)
- Build: `pip install -r requirements.txt` (from python-ai/)
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Health: GET `/health`
- Analyzes resumes and returns skills + gaps + score

### Linking Services on Render

The **render.yaml** automatically handles service linking:

```yaml
- key: PYTHON_URL
  fromService:
    name: futrix-python-ai
    type: web
    property: host
```

This means Render will:
1. Deploy both services
2. Get the Python service URL
3. Inject it as `PYTHON_URL` env var in Node API

**If you deploy each service manually**, you'll need to:
1. Deploy Python AI first → copy its URL
2. Set `PYTHON_URL=<python-url>` in Node API env vars
3. Redeploy Node API

## 🎯 Features Working

✅ Email login (passwordless)
✅ Google OAuth 2.0
✅ Resume text upload & analysis
✅ Skills extraction
✅ Gap analysis
✅ Readiness score (0-100)
✅ Career roadmap
✅ Job matching
✅ Analysis history
✅ Mobile responsive
✅ Error retry logic
✅ Token auto-refresh

## 📊 API Endpoints

```
POST   /api/login                  - Email login
POST   /api/auth/google           - Google OAuth
POST   /api/auth/refresh          - Refresh token
GET    /api/auth/verify           - Verify session
POST   /api/auth/logout           - Logout
POST   /api/upload-resume         - Analyze resume
GET    /api/history               - Get past analyses
POST   /api/jobs/match            - Match job roles
GET    /health                    - Service status
GET    /                           - API info
```

## 🔍 Troubleshooting 503 Service Unavailable

### Common Causes

| Error | Cause | Solution |
|-------|-------|----------|
| 503 Analysis failed | Python AI service not deployed | Deploy Python service to Render |
| 503 Service unavailable | `PYTHON_URL` not set | Check Render env vars |
| 503 Cannot reach service | Python service down/restarting | Wait 2-3 minutes, try again |
| 503 Request timeout | Python takes >60s to analyze | Check resume length |

### Diagnostic Steps

1. **Check Node API health:**
   ```
   curl https://futrix-node-api.onrender.com/health
   ```
   Should show:
   ```json
   {
     "status": "ok",
     "pythonUrl": "https://futrix-python-ai.onrender.com",
     "services": {
       "python_ai": "configured"
     }
   }
   ```

2. **Check Python AI health:**
   ```
   curl https://futrix-python-ai.onrender.com/health
   ```
   Should return: `{"status":"ok"}`

3. **Check Render logs:**
   - Go to Render dashboard
   - Click futrix-node-api → Logs
   - Look for `[AI-Service]` lines showing connection attempts
   - Check for `PYTHON_URL` value being logged

4. **Test resume upload with minimal text:**
   - Use exactly 50+ characters
   - Simple text like: `React Node.js Python JavaScript Docker AWS` (repeated to 50+ chars)
   - If it works with minimal text, issue is with complex analysis

### Debug: Enable Verbose Logging

In Node API Render settings:
```
DEBUG=*
```

Then check logs for detailed `[AI-Service]` output.

## 🧪 Testing Checklist

Before production deployment:

- [ ] Python AI service deployed and running
- [ ] Node API can reach Python service (check `/health`)
- [ ] Frontend environment variable set correctly
- [ ] Can log in with email
- [ ] Can upload resume (50+ chars) and get analysis
- [ ] Python service logs show successful processing
- [ ] No 503 errors when uploading resume
- [ ] Mobile layout responsive
- [ ] All navigation links work

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use (local) | Kill process: `Get-Process <name> \| Stop-Process` |
| 503 AI Service error | Ensure both Render services are deployed and running |
| Login fails | Check MongoDB connection + Google OAuth credentials |
| CORS errors | Clear browser cache and refresh |
| Python service timeout | Increase to 120s on first attempt in nodeRoutes.js |
| "PYTHON_URL not configured" | Check Render dashboard env vars |

## 📝 Environment Setup

### Local Development

**node-api/.env**
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/futrixai
PORT=5000
PYTHON_URL=http://localhost:8000
JWT_SECRET=dev-secret-key
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000
```

### Production (Render)

Set these in Render dashboard for **futrix-node-api**:
```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<generate-random-string>
GOOGLE_CLIENT_ID=<your-google-oauth-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-secret>
NODE_ENV=production
FRONTEND_URL=https://futrixai.netlify.app
PYTHON_URL=<auto-set-by-render-yaml>
```

## 📦 Project Structure

```
career-twin-ai/
├── client/              - React frontend (Netlify)
├── node-api/            - Express backend (Render)
├── python-ai/           - FastAPI AI engine (Render)
├── render.yaml          - Render deployment config (both services)
├── README.md            - Main documentation
└── README_PRODUCTION.md - This file
```

## ✨ Key Technologies

- **Frontend**: React 18, TypeScript, Material-UI, Vite
- **Backend**: Node.js, Express, JWT, MongoDB
- **AI**: Python, FastAPI, NLP
- **Auth**: JWT + Google OAuth 2.0
- **Hosting**: Netlify (frontend), Render.com (backend + AI)

## 🎓 Testing Resume

Test with this sample:

```
KIRTAN PANCHAL
Software Engineer
+91 8780092234 | kirtan@example.com

SKILLS
Python, JavaScript, React, Node.js, MongoDB, 
Docker, AWS, UI/UX Design, Git, Express.js

EXPERIENCE
Software Engineer - TechCorp (2024-Present)
- Built React dashboards
- Developed Node.js APIs
- AWS deployment

EDUCATION
B.Tech CSE (AIML) - RAI University (2024-2028)
CGPA: 8.8
```

## 🚀 Deployment Steps (First Time)

### 1. Deploy Python AI to Render

```bash
# In python-ai/ directory
git push origin main
```

On Render.com:
1. Click "New +" → "Web Service"
2. Connect GitHub repo
3. Name: `futrix-python-ai`
4. Root Directory: `python-ai`
5. Build: `pip install -r requirements.txt`
6. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Deploy

Note the URL (e.g., `https://futrix-python-ai.onrender.com`)

### 2. Deploy Node API to Render

```bash
git push origin main
```

On Render.com:
1. Click "New +" → "Web Service"
2. Connect GitHub repo
3. Name: `futrix-node-api`
4. Root Directory: `node-api`
5. Build: `npm install`
6. Start: `node server.js`
7. Environment Variables:
   - `MONGO_URI=<your-uri>`
   - `PYTHON_URL=https://futrix-python-ai.onrender.com` (from step 1)
   - `JWT_SECRET=<random>`
   - `GOOGLE_CLIENT_ID=<your-id>`
   - `GOOGLE_CLIENT_SECRET=<your-secret>`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://futrixai.netlify.app`
8. Deploy

### 3. Deploy Frontend to Netlify

```bash
cd client
npm run build
```

On Netlify:
1. Drag & drop `client/dist` folder
2. Or connect GitHub and auto-deploy
3. Set `VITE_API_URL=https://futrix-node-api.onrender.com`
4. Deploy

## 📞 Support

For issues during setup:
1. Check Render service logs
2. Review browser console (F12)
3. Test health endpoints
4. Verify all env vars are set
5. Check ports aren't conflicting (local)

---

**Status**: ✅ Production Ready
**Version**: 2.0.1
**Last Updated**: August 2024
