# Render.com Deployment Checklist for Futrix AI

Complete this checklist to deploy all 3 services correctly on Render.com.

## Prerequisites

- [ ] GitHub repository with code pushed
- [ ] MongoDB Atlas account with connection string
- [ ] Google OAuth credentials (Client ID + Secret)
- [ ] Netlify account for frontend (optional, but recommended)

---

## Phase 1: Initial Setup (One-time only)

### 1.1 Prepare Render.com

- [ ] Create Render.com account at https://render.com
- [ ] Connect GitHub repository
- [ ] Review render.yaml file in project root
- [ ] Ensure service names in render.yaml don't conflict with existing services

### 1.2 Prepare MongoDB Atlas

- [ ] Create MongoDB cluster
- [ ] Get connection string (look like: `mongodb+srv://user:pass@cluster.mongodb.net/database`)
- [ ] Add Render IP range to Network Access (if required)
  - Go to MongoDB Atlas → Network Access
  - Add IP Address: `0.0.0.0/0` (allows all IPs)
  - Or use Render.com's IP whitelist

### 1.3 Prepare Google OAuth

- [ ] Go to Google Cloud Console
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized redirect URIs:
  - `https://futrix-node-api.onrender.com/api/auth/google`
  - `https://futrixai.netlify.app` (frontend)
- [ ] Note Client ID and Client Secret

---

## Phase 2: Deploy Python AI Service

### 2.1 Create Service on Render

On Render.com dashboard:
- [ ] Click "New +" → "Web Service"
- [ ] Select GitHub repository
- [ ] Configure:
  - **Name:** `futrix-python-ai`
  - **Environment:** Python 3
  - **Root Directory:** `python-ai`
  - **Build Command:** `pip install -r requirements.txt`
  - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
  - **Plan:** Free tier (minimum)

### 2.2 Deploy

- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (3-5 minutes)
- [ ] Check logs for errors
- [ ] Note service URL (e.g., `https://futrix-python-ai.onrender.com`)
- [ ] Test health endpoint:
  ```bash
  curl https://futrix-python-ai.onrender.com/health
  ```
  Should return: `{"status":"ok"}`

**Status:** ✅ Python AI deployed and running

---

## Phase 3: Deploy Node API Service

### 3.1 Create Service on Render

On Render.com dashboard:
- [ ] Click "New +" → "Web Service"
- [ ] Select GitHub repository
- [ ] Configure:
  - **Name:** `futrix-node-api`
  - **Environment:** Node
  - **Root Directory:** `node-api`
  - **Build Command:** `npm install`
  - **Start Command:** `node server.js`
  - **Plan:** Free tier (minimum)

### 3.2 Set Environment Variables

In the environment section, add:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/futrixai?retryWrites=true&w=majority
JWT_SECRET=[Render will generate this for you - click the "Generate" button]
JWT_REFRESH_SECRET=[Render will generate this for you - click the "Generate" button]
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NODE_ENV=production
FRONTEND_URL=https://futrixai.netlify.app
PYTHON_URL=https://futrix-python-ai.onrender.com
PORT=10000
```

**Important:** Make sure:
- [ ] `PYTHON_URL` matches your Python service URL exactly
- [ ] `MONGO_URI` has correct username/password
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are from Google Console
- [ ] No trailing slashes in URLs

### 3.3 Deploy

- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Check logs for errors
- [ ] Note service URL (e.g., `https://futrix-node-api.onrender.com`)
- [ ] Test health endpoint:
  ```bash
  curl https://futrix-node-api.onrender.com/health
  ```
  Should return JSON with:
  ```json
  {
    "status": "ok",
    "pythonUrl": "https://futrix-python-ai.onrender.com",
    "services": {
      "python_ai": "configured"
    }
  }
  ```

**Status:** ✅ Node API deployed and connected to Python AI

---

## Phase 4: Deploy Frontend (Netlify)

### 4.1 Build Locally

```bash
cd client
npm run build
```

This creates `client/dist` folder with production build.

### 4.2 Deploy to Netlify

Option A: Drag & Drop (simplest)
- [ ] Go to https://netlify.com
- [ ] Create new site → "Deploy manually"
- [ ] Drag `client/dist` folder onto the page
- [ ] Site will be deployed with auto-generated URL

Option B: GitHub Integration (recommended)
- [ ] Go to https://netlify.com
- [ ] Create new site → "Connect to Git"
- [ ] Select GitHub → authorize
- [ ] Choose your repository
- [ ] Configure:
  - **Build command:** `npm run build` (from root)
  - **Publish directory:** `client/dist`
  - **Environment variables:**
    ```
    VITE_API_URL=https://futrix-node-api.onrender.com
    ```
- [ ] Deploy

### 4.3 Verify Frontend

- [ ] Website loads at Netlify URL
- [ ] Can log in with email
- [ ] Can upload resume
- [ ] Analysis completes without 503 errors

**Status:** ✅ Frontend deployed

---

## Phase 5: Post-Deployment Testing

### 5.1 Run Diagnostics

```bash
node diagnose.js https://futrix-node-api.onrender.com https://futrix-python-ai.onrender.com
```

Expected output:
```
✅ SUCCESS: HTTP 200 (Node API)
✅ SUCCESS: HTTP 200 (Python AI)
```

### 5.2 Test User Journey

- [ ] Visit frontend URL
- [ ] Sign up with email
- [ ] Verify email login works
- [ ] Try Google OAuth login
- [ ] Upload a test resume:
  ```
  React Node.js Python JavaScript Docker AWS
  React Node.js Python JavaScript Docker AWS (repeated)
  ```
- [ ] Verify analysis completes
- [ ] Check that skills are extracted correctly
- [ ] Verify readiness score is calculated
- [ ] Try job matching feature

### 5.3 Check Logs

On Render dashboard for each service:
- [ ] No error messages
- [ ] No "ECONNREFUSED" errors
- [ ] No "PYTHON_URL not configured" errors
- [ ] Resume analysis completed successfully

### 5.4 Test Mobile

- [ ] Open frontend on mobile browser
- [ ] Verify responsive layout
- [ ] Complete full user flow on mobile

**Status:** ✅ All services working

---

## Phase 6: Optional: Custom Domain

### 6.1 Point Domain to Netlify (Frontend)

- [ ] Purchase domain (GoDaddy, Namecheap, etc.)
- [ ] Go to Netlify → Domain settings
- [ ] Add your custom domain
- [ ] Update nameservers at domain registrar
- [ ] Wait for DNS propagation (can take 24-48 hours)

### 6.2 Update OAuth Redirect URI

- [ ] Go to Google Cloud Console
- [ ] Add new authorized redirect URI:
  - `https://your-custom-domain.com`
  - `https://your-custom-domain.com/auth/callback`

**Status:** ✅ Custom domain configured

---

## Troubleshooting During Deployment

### Python AI build fails

- [ ] Check `python-ai/requirements.txt` is properly formatted
- [ ] Check for syntax errors in `python-ai/main.py`
- [ ] Check Python version (3.9+)
- [ ] Review build logs on Render

### Node API build fails

- [ ] Check `node-api/package.json` is valid JSON
- [ ] Check for missing dependencies
- [ ] Check Node version (18+)
- [ ] Review build logs on Render

### Services deployed but 503 error

- [ ] Verify `PYTHON_URL` is set correctly in Node API
- [ ] Test Python AI health endpoint directly
- [ ] Check both services are in "running" state (not "deploying")
- [ ] Wait 2-3 minutes for services to fully boot up
- [ ] Restart Python AI service (Manual Deploy button)

### Login doesn't work

- [ ] Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- [ ] Verify Google OAuth URLs in Google Console match Render URLs
- [ ] Check `MONGODB_URI` is accessible from Render
- [ ] Check MongoDB credentials are correct

### Frontend shows 404

- [ ] Check `VITE_API_URL` is set to Node API URL (with https://)
- [ ] Verify API URL doesn't have trailing slash
- [ ] Check CORS settings on backend
- [ ] Check browser console for errors

---

## Monitoring & Maintenance

### Weekly Checks

- [ ] Test login functionality
- [ ] Test resume upload and analysis
- [ ] Check Render dashboard for service health
- [ ] Review logs for any errors

### Monthly Checks

- [ ] Check for library updates
- [ ] Review error logs for patterns
- [ ] Test on different browsers/devices
- [ ] Monitor response times

### Upgrades & Updates

When deploying code changes:
- [ ] Push code to GitHub
- [ ] Render auto-redeploys both services
- [ ] Wait for builds to complete
- [ ] Run diagnostics to verify
- [ ] Test full user flow

---

## Cost Estimation

**Free Tier (Unlimited):**
- [ ] 2 × Render Web Services (free)
- [ ] 1 × Netlify site (free with custom domain upgrade available)
- [ ] MongoDB Atlas free tier (512MB)

**Total Monthly Cost:** $0 (free tier)

**For Production with Paid Plans:**
- Node API: $7/month (Render)
- Python AI: $7/month (Render)
- Netlify custom domain: $0-20/month
- MongoDB: $0 (free) or $57+/month (shared M2 cluster)

**Total:** ~$14-84/month

---

## Quick Reference

| Service | URL | Status | Health |
|---------|-----|--------|--------|
| Frontend | https://futrixai.netlify.app | Deployed | Visit and test |
| Node API | https://futrix-node-api.onrender.com | Deployed | /health |
| Python AI | https://futrix-python-ai.onrender.com | Deployed | /health |

---

## Next Steps After Deployment

1. **Monitor performance:** Check Render dashboard weekly
2. **Collect feedback:** Gather user feedback from deployed app
3. **Plan features:** Document feature requests
4. **Plan scaling:** If traffic increases, upgrade to paid plans

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Status:** ☐ In Progress | ☐ Complete | ☐ Issues Found

---

**Reference Documentation:**
- [Render.com Docs](https://render.com/docs)
- [Netlify Docs](https://docs.netlify.com)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [Project README](./README.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_503.md)
