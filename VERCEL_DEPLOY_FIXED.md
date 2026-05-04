# ✅ Updated Vercel Deployment Guide - All Issues Fixed

## 🎉 What Was Fixed

### 1. ✅ CORS Configuration (Backend)
- Removed Netlify URL
- Dynamic origin checking via `FRONTEND_URL` environment variable
- Supports localhost + any Vercel deployment URL

### 2. ✅ API URL Configuration (Frontend)
- Uses `VITE_API_URL` environment variable
- No hardcoded localhost URLs in production
- Fails loudly if backend URL not configured

### 3. ✅ Security Headers (Frontend)
- Added `Cross-Origin-Opener-Policy: same-origin-allow-popups`
- Allows Google OAuth popup to communicate with parent window
- Added other security headers (X-Frame-Options, etc.)

---

## 🚀 Deploy to Vercel - Complete Steps

### STEP 1: Deploy Backend

#### 1.1: Navigate to Backend
```bash
cd "d:\Projects\AI career twin\career-twin-ai\node-api"
```

#### 1.2: Verify Files
```bash
dir
```
Should see: `server.js`, `package.json`, `vercel.json`

#### 1.3: Deploy
```bash
vercel --prod
```

#### 1.4: Answer Prompts
- Project name: `futrix-backend`
- Directory: Press Enter
- Override settings: `N`

#### 1.5: Copy Backend URL
Example: `https://futrix-backend-xxxxx.vercel.app`

---

### STEP 2: Add Backend Environment Variables

Go to: https://vercel.com/dashboard → Your backend project → Settings → Environment Variables

Add these:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | `your_mongodb_connection_string` |
| `JWT_SECRET` | `your_jwt_secret` |
| `JWT_REFRESH_SECRET` | `your_jwt_refresh_secret` |
| `GOOGLE_CLIENT_ID` | `your_google_client_id` |
| `GOOGLE_CLIENT_SECRET` | `your_google_client_secret` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `http://localhost:5173` (temporary - update after frontend deployment) |

**Important:** Select "Production", "Preview", and "Development" for all variables.

#### Redeploy Backend
Go to Deployments → Click three dots → Redeploy

---

### STEP 3: Test Backend

Open: `https://futrix-backend-xxxxx.vercel.app/health`

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "mongodb": "connected",
  "environment": "production"
}
```

✅ If you see this, backend is working!

---

### STEP 4: Deploy Frontend

#### 4.1: Navigate to Frontend
```bash
cd "d:\Projects\AI career twin\career-twin-ai\client"
```

#### 4.2: Verify Files
```bash
dir
```
Should see: `src/`, `package.json`, `vercel.json`, `index.html`

#### 4.3: Deploy
```bash
vercel --prod
```

#### 4.4: Answer Prompts
- Project name: `futrix-frontend`
- Directory: Press Enter
- Override settings: `N`

#### 4.5: Copy Frontend URL
Example: `https://futrix-frontend-xxxxx.vercel.app`

---

### STEP 5: Add Frontend Environment Variables

Go to: https://vercel.com/dashboard → Your frontend project → Settings → Environment Variables

Add these:

| Variable | Value |
|----------|-------|
| `VITE_GOOGLE_CLIENT_ID` | `your_google_client_id` |
| `VITE_API_URL` | `https://futrix-backend-xxxxx.vercel.app` (your backend URL from Step 1) |

**Important:** Select all environments.

#### Redeploy Frontend
Go to Deployments → Redeploy

---

### STEP 6: Update Backend FRONTEND_URL

Go to backend project → Settings → Environment Variables

**Edit `FRONTEND_URL`:**
- Old value: `http://localhost:5173`
- New value: `https://futrix-frontend-xxxxx.vercel.app` (your frontend URL)

**Save and Redeploy Backend**

---

### STEP 7: Update Google OAuth Console

Go to: https://console.cloud.google.com/apis/credentials

Click on your OAuth 2.0 Client ID

#### Authorized JavaScript Origins:
Add your production URL (keep localhost for development):
```
http://localhost:5173
https://futrix-frontend-xxxxx.vercel.app
```

#### Authorized Redirect URIs:
Add these (keep localhost):
```
http://localhost:5173
http://localhost:5173/login
https://futrix-frontend-xxxxx.vercel.app
https://futrix-frontend-xxxxx.vercel.app/login
https://futrix-frontend-xxxxx.vercel.app/dashboard
```

**Click SAVE**

**Wait 2-3 minutes** for Google to propagate changes.

---

### STEP 8: Test Your Deployed App! 🎉

#### 8.1: Test Backend Health
```
https://futrix-backend-xxxxx.vercel.app/health
```
Should return JSON with `"status": "ok"`

#### 8.2: Test Frontend
```
https://futrix-frontend-xxxxx.vercel.app
```
Should show login page

#### 8.3: Test Google OAuth
1. Click "Sign in with Google"
2. Select account
3. Should redirect to dashboard
4. ✅ Login successful!

---

## 🔍 Troubleshooting

### Issue: CORS Error

**Error in console:**
```
Access to XMLHttpRequest at 'https://backend.vercel.app/api/...' 
from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**Fix:**
1. Check backend `FRONTEND_URL` environment variable
2. Make sure it matches your frontend URL exactly
3. Redeploy backend
4. Clear browser cache

---

### Issue: Google OAuth Popup Blocked

**Error:**
```
Cross-Origin-Opener-Policy policy would block the window.postMessage call
```

**Fix:**
1. Check `client/vercel.json` has the headers section
2. Redeploy frontend
3. Clear browser cache
4. Try in incognito mode

---

### Issue: API Calls Return 404

**Error:**
```
GET https://frontend.vercel.app/api/health 404
```

**Fix:**
1. Check `VITE_API_URL` is set in frontend environment variables
2. Should be: `https://your-backend.vercel.app` (no `/api` at the end)
3. Redeploy frontend

---

### Issue: Google OAuth 403

**Error:**
```
[GSI_LOGGER]: The given origin is not allowed
```

**Fix:**
1. Check Google Console has your production URL
2. Wait 2-3 minutes after adding
3. Clear browser cache
4. Try incognito mode

---

## 📋 Final Checklist

### Backend:
- [ ] Deployed from `node-api/` folder
- [ ] All environment variables added
- [ ] `FRONTEND_URL` set to production URL
- [ ] `/health` endpoint returns 200 OK
- [ ] Backend URL saved

### Frontend:
- [ ] Deployed from `client/` folder
- [ ] `VITE_GOOGLE_CLIENT_ID` added
- [ ] `VITE_API_URL` added (backend URL)
- [ ] Homepage loads
- [ ] Frontend URL saved

### Google Console:
- [ ] Production URL added to authorized origins
- [ ] Production URL added to redirect URIs
- [ ] Waited 2-3 minutes
- [ ] Saved changes

### Testing:
- [ ] Backend health check works
- [ ] Frontend loads
- [ ] Google OAuth login works
- [ ] Can access dashboard
- [ ] No CORS errors
- [ ] No 404 errors

---

## 🎯 Key Changes Made

### 1. Backend CORS (server.js)
**Before:**
```javascript
const allowedOrigins = [
    'http://localhost:5173',
    'https://futrix-ai.netlify.app',  // ❌ Netlify
    process.env.FRONTEND_URL,
];
```

**After:**
```javascript
const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL,  // ✅ Vercel via env var
].filter(Boolean);
```

### 2. Frontend API URL (api.ts)
**Already correct:**
```typescript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',  // ✅ Uses env var
});
```

### 3. Frontend Security Headers (vercel.json)
**Added:**
```json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [
      {
        "key": "Cross-Origin-Opener-Policy",
        "value": "same-origin-allow-popups"  // ✅ Allows OAuth popup
      }
    ]
  }]
}
```

---

## 🚀 You're Ready!

All fixes are applied. Follow the steps above to deploy to Vercel.

**If you encounter any errors, send me:**
1. The exact error message
2. Screenshot of browser console (F12)
3. Which step you're on

I'll help you fix it immediately! 🎉
