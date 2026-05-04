# 🚀 Vercel Deployment Guide

## ✅ Netlify Files Removed

All Netlify-related configurations have been removed:
- ❌ `netlify.toml` - Deleted
- ✅ `vercel.json` - Created (root)
- ✅ `client/vercel.json` - Created (frontend)
- ✅ `node-api/vercel.json` - Created (backend)

---

## 📋 Deployment Strategy

You'll deploy **TWO separate projects** on Vercel:

1. **Frontend (React)** - `client/` folder
2. **Backend (Node.js API)** - `node-api/` folder

---

# PART 1: Deploy Backend API

## Step 1: Prepare Backend for Deployment

### Update CORS in server.js

The backend needs to allow your Vercel frontend domain.

**File**: `node-api/server.js`

After deployment, you'll update this line:
```javascript
origin: process.env.FRONTEND_URL || 'http://localhost:5173',
```

To:
```javascript
origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
```

---

## Step 2: Deploy Backend to Vercel

### Via Vercel CLI (Recommended):

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy Backend:**
   ```bash
   cd "d:\Projects\AI career twin\career-twin-ai\node-api"
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `futrix-ai-backend` (or your choice)
   - Directory? `.` (current directory)
   - Override settings? **N**

5. **Add Environment Variables:**
   ```bash
   vercel env add MONGO_URI
   vercel env add JWT_SECRET
   vercel env add JWT_REFRESH_SECRET
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET
   vercel env add FRONTEND_URL
   vercel env add NODE_ENV
   ```

   For each variable, paste the value from your `.env` file.

6. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

7. **Copy your backend URL:**
   ```
   https://futrix-ai-backend.vercel.app
   ```

---

### Via Vercel Dashboard (Alternative):

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"** or **"Add New Project"**
3. Select **"Import from GitHub"** (or upload folder)
4. Choose the `node-api` folder
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
6. Add Environment Variables:
   - `MONGO_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = Your JWT secret
   - `JWT_REFRESH_SECRET` = Your refresh secret
   - `GOOGLE_CLIENT_ID` = Your Google Client ID
   - `GOOGLE_CLIENT_SECRET` = Your Google Client Secret
   - `FRONTEND_URL` = (will add after frontend deployment)
   - `NODE_ENV` = `production`
7. Click **"Deploy"**
8. Copy your backend URL

---

# PART 2: Deploy Frontend

## Step 1: Update Frontend Environment Variables

**File**: `client/.env`

Update with your deployed backend URL:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=https://your-backend.vercel.app
```

---

## Step 2: Update API Base URL

**File**: `client/src/services/api.ts`

Change:
```typescript
const api = axios.create({
    baseURL: '/api',
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
});
```

To:
```typescript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
});
```

---

## Step 3: Deploy Frontend to Vercel

### Via Vercel CLI:

1. **Deploy Frontend:**
   ```bash
   cd "d:\Projects\AI career twin\career-twin-ai\client"
   vercel
   ```

2. **Follow prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `futrix-ai-frontend` (or your choice)
   - Directory? `.` (current directory)
   - Override settings? **N**

3. **Add Environment Variables:**
   ```bash
   vercel env add VITE_GOOGLE_CLIENT_ID
   vercel env add VITE_API_URL
   ```

4. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

5. **Copy your frontend URL:**
   ```
   https://futrix-ai-frontend.vercel.app
   ```

---

### Via Vercel Dashboard:

1. Go to: https://vercel.com/new
2. Click **"Add New Project"**
3. Select the `client` folder
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_GOOGLE_CLIENT_ID` = Your Google Client ID
   - `VITE_API_URL` = Your backend URL (from Part 1)
6. Click **"Deploy"**
7. Copy your frontend URL

---

# PART 3: Update Configurations

## Step 1: Update Backend CORS

Go to your backend project on Vercel:
1. Go to **Settings** → **Environment Variables**
2. Update `FRONTEND_URL` to your frontend URL:
   ```
   https://your-frontend.vercel.app
   ```
3. **Redeploy** the backend

---

## Step 2: Update Google OAuth Console

Go to: https://console.cloud.google.com/apis/credentials

Click on your OAuth 2.0 Client ID

### Update Authorized JavaScript Origins:
```
https://your-frontend.vercel.app
```

### Update Authorized Redirect URIs:
```
https://your-frontend.vercel.app
https://your-frontend.vercel.app/login
https://your-frontend.vercel.app/dashboard
```

Click **SAVE**

---

# PART 4: Test Deployment

## Step 1: Test Backend

Open: `https://your-backend.vercel.app/health`

Should return:
```json
{"status":"ok","timestamp":"...","mongodb":"connected"}
```

---

## Step 2: Test Frontend

1. Open: `https://your-frontend.vercel.app`
2. Click **"Sign in with Google"**
3. Login should work!

---

# 📋 Deployment Checklist

## Backend Deployment:
- [ ] Backend deployed to Vercel
- [ ] Environment variables added (MONGO_URI, JWT secrets, Google credentials)
- [ ] Backend URL copied
- [ ] `/health` endpoint returns success

## Frontend Deployment:
- [ ] Frontend deployed to Vercel
- [ ] Environment variables added (VITE_GOOGLE_CLIENT_ID, VITE_API_URL)
- [ ] Frontend URL copied
- [ ] Site loads correctly

## Configuration Updates:
- [ ] Backend FRONTEND_URL updated with frontend URL
- [ ] Backend redeployed
- [ ] Google Console authorized origins updated
- [ ] Google Console redirect URIs updated

## Testing:
- [ ] Backend health check works
- [ ] Frontend loads
- [ ] Google OAuth login works
- [ ] Can access dashboard
- [ ] Can upload resume

---

# 🐛 Common Issues

## Issue: CORS Error

**Cause**: Backend FRONTEND_URL not set correctly

**Fix**:
1. Go to backend Vercel project
2. Settings → Environment Variables
3. Update `FRONTEND_URL` to your frontend URL
4. Redeploy

---

## Issue: Google OAuth 403

**Cause**: Google Console not updated with production URLs

**Fix**:
1. Go to Google Console
2. Add production URLs to authorized origins and redirect URIs
3. Wait 2-3 minutes
4. Try again

---

## Issue: 500 Error on API Calls

**Cause**: Environment variables not set in Vercel

**Fix**:
1. Check all environment variables are set
2. Especially `MONGO_URI`, `JWT_SECRET`, `GOOGLE_CLIENT_SECRET`
3. Redeploy

---

## Issue: Build Failed

**Cause**: Missing dependencies or build errors

**Fix**:
1. Check build logs in Vercel dashboard
2. Make sure `package.json` has all dependencies
3. Test build locally: `npm run build`

---

# 📝 Environment Variables Reference

## Backend (node-api):
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
AI_SERVICE_URL=https://your-python-service.vercel.app/analyze
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

## Frontend (client):
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=https://your-backend.vercel.app
```

---

# 🚀 Quick Deploy Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy Backend
cd "d:\Projects\AI career twin\career-twin-ai\node-api"
vercel --prod

# Deploy Frontend
cd "d:\Projects\AI career twin\career-twin-ai\client"
vercel --prod
```

---

# 📞 Need Help?

If you encounter errors during deployment:

1. **Copy the error message**
2. **Take a screenshot of Vercel build logs**
3. **Send me the error**
4. I'll help you fix it immediately!

---

# ✅ Summary

**What's Ready:**
- ✅ Netlify config removed
- ✅ Vercel configs created
- ✅ Deployment guide ready
- ✅ Environment variables documented

**What You Need to Do:**
1. Deploy backend to Vercel
2. Deploy frontend to Vercel
3. Update Google Console with production URLs
4. Test!

**Estimated Time:** 20-30 minutes

---

**You're ready to deploy! Start with the backend, then frontend.** 🚀

**If you get any errors, send them to me and I'll help immediately!**
