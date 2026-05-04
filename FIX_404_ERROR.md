# 🔧 Fix Vercel 404 NOT_FOUND Error

## Problem Identified
You're getting 404 because Vercel can't find your application files.

## Root Cause
Most likely: You deployed from the ROOT folder instead of the CLIENT or NODE-API folder.

---

## ✅ SOLUTION: Deploy from Correct Folders

### Step 1: Delete Wrong Deployment

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** (bottom left)
4. Scroll to bottom
5. Click **"Delete Project"**
6. Type the project name to confirm
7. Click **Delete**

---

### Step 2: Deploy Backend (Node.js API)

#### 2.1: Navigate to Backend Folder
```bash
cd "d:\Projects\AI career twin\career-twin-ai\node-api"
```

#### 2.2: Verify You're in the Right Place
```bash
dir
```

**You should see:**
- server.js ✅
- package.json ✅
- vercel.json ✅
- routes/ folder ✅
- models/ folder ✅

**If you DON'T see these files, you're in the wrong folder!**

#### 2.3: Deploy
```bash
vercel --prod
```

#### 2.4: Answer Prompts
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **Project name?** → `futrix-backend`
- **In which directory is your code located?** → `.` (just press Enter)
- **Want to override settings?** → `N`

#### 2.5: Copy Backend URL
You'll get something like:
```
✅ Production: https://futrix-backend-xxxxx.vercel.app
```

**SAVE THIS URL!**

#### 2.6: Test Backend
Open in browser:
```
https://futrix-backend-xxxxx.vercel.app/health
```

**Expected:** JSON response with status "ok"
**If 404:** Continue to troubleshooting section below

---

### Step 3: Deploy Frontend (React App)

#### 3.1: Navigate to Frontend Folder
```bash
cd "d:\Projects\AI career twin\career-twin-ai\client"
```

#### 3.2: Verify You're in the Right Place
```bash
dir
```

**You should see:**
- src/ folder ✅
- public/ folder ✅
- package.json ✅
- vercel.json ✅
- index.html ✅
- vite.config.ts ✅

**If you DON'T see these files, you're in the wrong folder!**

#### 3.3: Deploy
```bash
vercel --prod
```

#### 3.4: Answer Prompts
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N`
- **Project name?** → `futrix-frontend`
- **In which directory is your code located?** → `.` (just press Enter)
- **Want to override settings?** → `N`

#### 3.5: Copy Frontend URL
You'll get something like:
```
✅ Production: https://futrix-frontend-xxxxx.vercel.app
```

**SAVE THIS URL!**

#### 3.6: Test Frontend
Open in browser:
```
https://futrix-frontend-xxxxx.vercel.app
```

**Expected:** Login page loads
**If 404:** Continue to troubleshooting section below

---

## 🐛 Troubleshooting 404 Errors

### Issue 1: Backend Still Shows 404

**Symptoms:**
- `/health` endpoint returns 404
- All API routes return 404

**Cause:** Vercel doesn't recognize it as a Node.js app

**Fix:**

1. Check `node-api/vercel.json` exists and contains:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

2. If missing or wrong, create/fix it
3. Redeploy:
```bash
cd "d:\Projects\AI career twin\career-twin-ai\node-api"
vercel --prod
```

---

### Issue 2: Frontend Shows 404 on Routes

**Symptoms:**
- Homepage loads
- But `/dashboard`, `/login` etc. show 404

**Cause:** React Router routes not configured for Vercel

**Fix:**

1. Check `client/vercel.json` exists and contains:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. If missing or wrong, create/fix it
3. Redeploy:
```bash
cd "d:\Projects\AI career twin\career-twin-ai\client"
vercel --prod
```

---

### Issue 3: Blank Page or "Failed to Load"

**Symptoms:**
- Page loads but shows blank screen
- Console shows errors about missing files

**Cause:** Wrong build output directory

**Fix:**

1. Go to Vercel project → **Settings** → **Build & Development Settings**
2. Set:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Save
4. Go to **Deployments** → Click three dots → **Redeploy**

---

### Issue 4: "This Serverless Function has crashed"

**Symptoms:**
- Backend shows error instead of 404
- Error mentions "crashed" or "timeout"

**Cause:** Missing environment variables or code error

**Fix:**

1. Go to backend project → **Settings** → **Environment Variables**
2. Add ALL required variables:
   - MONGO_URI
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - NODE_ENV=production
   - FRONTEND_URL
3. Redeploy

---

## 📋 Verification Checklist

After deploying, verify:

### Backend Checklist:
- [ ] Deployed from `node-api/` folder (not root)
- [ ] `vercel.json` exists in `node-api/`
- [ ] `/health` endpoint returns JSON (not 404)
- [ ] Environment variables added in Vercel
- [ ] Backend URL saved

### Frontend Checklist:
- [ ] Deployed from `client/` folder (not root)
- [ ] `vercel.json` exists in `client/`
- [ ] Homepage loads (not 404)
- [ ] Can navigate to different routes
- [ ] Frontend URL saved

---

## 🎯 Common Mistakes

### ❌ WRONG: Deploying from Root
```bash
cd "d:\Projects\AI career twin\career-twin-ai"
vercel --prod  # ❌ This deploys the whole project
```

### ✅ CORRECT: Deploy Each Service Separately
```bash
# Backend
cd "d:\Projects\AI career twin\career-twin-ai\node-api"
vercel --prod  # ✅ This deploys only the backend

# Frontend (separate project)
cd "d:\Projects\AI career twin\career-twin-ai\client"
vercel --prod  # ✅ This deploys only the frontend
```

---

## 📸 What to Send Me If Still Not Working

1. **Screenshot of Vercel deployment page** showing:
   - Source Files section
   - Build logs (if any errors)

2. **Tell me:**
   - Which folder did you run `vercel --prod` from?
   - What's the exact URL showing 404?
   - What do you see when you visit that URL?

3. **Run these commands and send output:**
```bash
# Check current directory
cd

# List files in node-api
dir "d:\Projects\AI career twin\career-twin-ai\node-api"

# List files in client
dir "d:\Projects\AI career twin\career-twin-ai\client"
```

---

## ✅ Success Indicators

You'll know it's working when:

**Backend:**
```
https://your-backend.vercel.app/health
→ Returns: {"status":"ok","mongodb":"connected"}
```

**Frontend:**
```
https://your-frontend.vercel.app
→ Shows: Login page with Google Sign-In button
```

---

## 🚀 Next Steps After Fixing 404

Once both are deployed successfully:

1. Add environment variables to both projects
2. Update backend FRONTEND_URL with frontend URL
3. Update Google Console with production URLs
4. Test login flow

---

**Follow this guide step by step. If you still get 404, send me the information requested above!**
