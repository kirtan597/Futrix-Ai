# 🚀 Complete Full-Stack Deployment Guide - Vercel

## 📋 What You'll Deploy

- **Backend (Node.js/Express)** → Vercel Serverless
- **Frontend (React/Vite)** → Vercel Static
- **Database** → MongoDB Atlas (already running)
- **Authentication** → Google OAuth

---

## ⚙️ Prerequisites (Already Done)

✅ MongoDB Atlas is running  
✅ Google OAuth credentials created  
✅ Project works locally on `localhost:5173` (frontend) and `localhost:5000` (backend)  
✅ Code is pushed to GitHub  

---

# PART 1: Deploy Backend to Vercel

## Step 1: Sign Up / Login to Vercel

### 1.1: Go to Vercel
- Open browser
- Go to: **https://vercel.com/signup**

### 1.2: Sign Up with GitHub
- Click **"Continue with GitHub"**
- Login to your GitHub account
- Click **"Authorize Vercel"**
- You'll be redirected to Vercel Dashboard

---

## Step 2: Import Your Repository

### 2.1: Create New Project
- You're now at: **https://vercel.com/dashboard**
- Click **"Add New..."** button (top right corner)
- Click **"Project"** from dropdown

### 2.2: Import Git Repository
- You'll see "Import Git Repository" section
- Find your repository: **"Futrix-Ai"** (or your repo name)
- Click **"Import"** button next to it

---

## Step 3: Configure Backend Project

You'll now see the "Configure Project" page with several sections.

### 3.1: Change Project Name
**Location:** Top of page, "Project Name" field

**What to do:**
1. Click in the text box that shows `futrix-ai`
2. Press `Ctrl + A` (select all)
3. Type: `futrix-backend`
4. Press `Tab` to move to next field

---

### 3.2: Set Framework Preset
**Location:** "Application Preset" dropdown

**What to do:**
1. Click the dropdown (shows "Other")
2. Select **"Other"**
3. Leave it as "Other"

---

### 3.3: Change Root Directory
**Location:** "Root Directory" section

**What to do:**
1. You'll see a box with `./` and an **"Edit"** button
2. Click the **"Edit"** button
3. The box becomes editable
4. Delete `./`
5. Type: `node-api`
6. Click **"Continue"** button that appears

**Result:** Root Directory should now show: `node-api`

---

### 3.4: Skip Build Settings
**Location:** "Build and Output Settings" (collapsed section)

**What to do:**
- Leave this section collapsed
- Don't click on it
- Skip to Environment Variables

---

### 3.5: Add Environment Variables
**Location:** "Environment Variables" section (collapsed)

**What to do:**

#### Step 1: Expand the section
- Click on **"Environment Variables"** text
- Section will expand showing **Key** and **Value** fields

---

#### Step 2: Open your .env file
**Before adding variables, prepare your values:**

1. Open VS Code
2. Navigate to: `node-api/.env`
3. Keep this file open - you'll copy values from here

**Your .env file looks like this:**
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
PORT=5000
FRONTEND_URL=http://localhost:5173
```

---

#### Step 3: Add MONGO_URI

**In Vercel page:**
1. Click in **Key** field
2. Type: `MONGO_URI`
3. Click in **Value** field
4. Go to your `node-api/.env` file
5. Find line: `MONGO_URI=mongodb+srv://...`
6. Copy EVERYTHING after the `=` sign (the entire connection string)
7. Paste in Vercel **Value** field
8. Click **"Add"** button

**Result:** You'll see `MONGO_URI` listed with a masked value

---

#### Step 4: Add JWT_SECRET

**In Vercel page:**
1. A new empty Key/Value appears
2. In **Key**, type: `JWT_SECRET`
3. From your `.env` file, copy the value after `JWT_SECRET=`
4. Paste in **Value** field
5. Click **"Add"**

---

#### Step 5: Add JWT_REFRESH_SECRET

1. In **Key**, type: `JWT_REFRESH_SECRET`
2. From `.env`, copy value after `JWT_REFRESH_SECRET=`
3. Paste in **Value**
4. Click **"Add"**

---

#### Step 6: Add GOOGLE_CLIENT_ID

1. In **Key**, type: `GOOGLE_CLIENT_ID`
2. From `.env`, copy value after `GOOGLE_CLIENT_ID=`
3. Paste in **Value**
4. Click **"Add"**

---

#### Step 7: Add GOOGLE_CLIENT_SECRET

1. In **Key**, type: `GOOGLE_CLIENT_SECRET`
2. From `.env`, copy value after `GOOGLE_CLIENT_SECRET=`
3. Paste in **Value**
4. Click **"Add"**

---

#### Step 8: Add NODE_ENV

1. In **Key**, type: `NODE_ENV`
2. In **Value**, type: `production`
3. Click **"Add"**

---

#### Step 9: Add FRONTEND_URL (temporary)

1. In **Key**, type: `FRONTEND_URL`
2. In **Value**, type: `http://localhost:5173`
3. Click **"Add"**

**Note:** We'll update this after deploying the frontend

---

**Summary:** You should now see 7 environment variables:
- MONGO_URI
- JWT_SECRET
- JWT_REFRESH_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- NODE_ENV
- FRONTEND_URL

---

## Step 4: Deploy Backend

### 4.1: Start Deployment
**Location:** Bottom of page

**What to do:**
1. Scroll down to the bottom
2. You'll see a big white **"Deploy"** button
3. Click **"Deploy"**

---

### 4.2: Wait for Deployment
**What you'll see:**
- Page changes to show "Building..." status
- Build logs appear (text scrolling)
- Progress indicator at top

**How long:** 2-5 minutes

**What to expect:**
- You'll see npm install logs
- "Installing dependencies..."
- "Building..."
- "Deploying..."

---

### 4.3: Deployment Success
**What you'll see:**
- 🎉 Confetti animation
- "Congratulations!" message
- A **"Visit"** button
- Your project URL displayed

---

## Step 5: Test Backend Deployment

### 5.1: Copy Backend URL
**What to do:**
1. Look for your URL (example: `https://futrix-backend-abc123.vercel.app`)
2. Right-click on **"Visit"** button
3. Click **"Copy link address"**
4. Paste it in Notepad - you'll need this later!

---

### 5.2: Test Health Endpoint
**What to do:**
1. Click the **"Visit"** button (opens new tab)
2. You'll see an error page - this is normal!
3. In the address bar, add `/health` to the end
4. Example: `https://futrix-backend-abc123.vercel.app/health`
5. Press Enter

**Expected Result:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-02T12:34:56.789Z",
  "mongodb": "connected",
  "environment": "production"
}
```

✅ **If you see this JSON, your backend is working!**

❌ **If you see an error, tell me what it says**

---

## Step 6: Save Backend URL

**IMPORTANT:** Copy your backend URL and save it!

Example: `https://futrix-backend-abc123.vercel.app`

You'll need this for:
- Frontend deployment
- Google OAuth configuration

---

# PART 2: Deploy Frontend to Vercel

## Step 7: Create Frontend Project

### 7.1: Go to Dashboard
1. Go back to: **https://vercel.com/dashboard**
2. Click **"Add New..."** button (top right)
3. Click **"Project"**

---

### 7.2: Import Repository Again
1. Find your repository: **"Futrix-Ai"**
2. Click **"Import"** button

**Note:** Yes, we're importing the same repository again - this is correct!

---

## Step 8: Configure Frontend Project

### 8.1: Change Project Name
**What to do:**
1. In "Project Name" field, change to: `futrix-frontend`

---

### 8.2: Set Framework Preset
**What to do:**
1. Click "Application Preset" dropdown
2. Select **"Vite"**

**Important:** Select "Vite", NOT "Other"!

---

### 8.3: Change Root Directory
**What to do:**
1. Click **"Edit"** button next to Root Directory
2. Delete `./`
3. Type: `client`
4. Click **"Continue"**

**Result:** Root Directory shows: `client`

---

### 8.4: Verify Build Settings
**Location:** "Build and Output Settings" section

**What to do:**
1. Click to expand "Build and Output Settings"
2. Verify these values (should be auto-filled):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

**If they're empty:**
- Build Command: Type `npm run build`
- Output Directory: Type `dist`

---

### 8.5: Add Frontend Environment Variables
**Location:** "Environment Variables" section

**What to do:**

#### Variable 1: VITE_GOOGLE_CLIENT_ID

1. Click to expand "Environment Variables"
2. In **Key**, type: `VITE_GOOGLE_CLIENT_ID`
3. Open your `client/.env` file
4. Copy the value after `VITE_GOOGLE_CLIENT_ID=`
5. Paste in **Value** field
6. Click **"Add"**

---

#### Variable 2: VITE_API_URL

1. In **Key**, type: `VITE_API_URL`
2. In **Value**, paste your **BACKEND URL** from Step 5.1
3. Example: `https://futrix-backend-abc123.vercel.app`
4. **IMPORTANT:** Do NOT add `/api` at the end!
5. Click **"Add"**

**Summary:** You should have 2 environment variables:
- VITE_GOOGLE_CLIENT_ID
- VITE_API_URL

---

## Step 9: Deploy Frontend

### 9.1: Start Deployment
1. Scroll to bottom
2. Click **"Deploy"** button
3. Wait 3-7 minutes (frontend takes longer than backend)

---

### 9.2: Wait for Build
**What you'll see:**
- Build logs scrolling
- "Installing dependencies..."
- "Building application..."
- Vite build output

---

### 9.3: Deployment Success
**What you'll see:**
- 🎉 Confetti animation
- "Congratulations!" message
- **"Visit"** button
- Frontend URL displayed

---

## Step 10: Test Frontend Deployment

### 10.1: Copy Frontend URL
1. Copy your frontend URL (example: `https://futrix-frontend-xyz789.vercel.app`)
2. Save it in Notepad

---

### 10.2: Test Frontend Loading
1. Click **"Visit"** button
2. Your login page should load!
3. You should see:
   - Your app logo/branding
   - "Sign in with Google" button

✅ **If you see the login page, frontend is deployed!**

**Don't test login yet** - we need to update configurations first.

---

# PART 3: Update Backend Configuration

## Step 11: Update Backend FRONTEND_URL

### 11.1: Go to Backend Project
1. Go to: **https://vercel.com/dashboard**
2. Click on **"futrix-backend"** project

---

### 11.2: Open Settings
1. Click **"Settings"** tab (top of page)
2. Click **"Environment Variables"** in left sidebar

---

### 11.3: Edit FRONTEND_URL
1. Find **"FRONTEND_URL"** in the list
2. Click **"Edit"** button (pencil icon on the right)
3. Delete old value: `http://localhost:5173`
4. Paste your frontend URL: `https://futrix-frontend-xyz789.vercel.app`
5. Click **"Save"** button

---

### 11.4: Redeploy Backend
**Important:** Changes require redeployment!

1. Click **"Deployments"** tab (top of page)
2. You'll see a list of deployments
3. Find the first row (latest deployment)
4. Click **three dots (⋯)** button on the right
5. Click **"Redeploy"**
6. A popup appears - click **"Redeploy"** button again
7. Wait 1-2 minutes for redeployment

**Result:** You'll see a green checkmark when complete

---

# PART 4: Update Google OAuth Console

## Step 12: Add Production URLs to Google Console

### 12.1: Open Google Cloud Console
1. Open new browser tab
2. Go to: **https://console.cloud.google.com/apis/credentials**
3. Login with your Google account if needed

---

### 12.2: Select Your Project
1. At the top left, you'll see a project name dropdown
2. Make sure your project is selected
3. If not, click dropdown and select your project

---

### 12.3: Find Your OAuth Client
1. You'll see "OAuth 2.0 Client IDs" section
2. Find your credential (example: "Web client 1")
3. Click on the **name** (not the edit icon)

---

### 12.4: Add Authorized JavaScript Origins

**What you see:** "Authorized JavaScript origins" section

**What to do:**
1. You'll see existing entry: `http://localhost:5173`
2. Click **"+ ADD URI"** button
3. Paste your **frontend URL**: `https://futrix-frontend-xyz789.vercel.app`
4. Press Tab or click outside the field

**Result:** You should have 2 JavaScript origins:
- `http://localhost:5173` (for local development)
- `https://futrix-frontend-xyz789.vercel.app` (production)

---

### 12.5: Add Authorized Redirect URIs

**What you see:** "Authorized redirect URIs" section

**What to do:**

**URI 1:**
1. Click **"+ ADD URI"** button
2. Paste: `https://futrix-frontend-xyz789.vercel.app`
3. Press Tab

**URI 2:**
1. Click **"+ ADD URI"** again
2. Paste: `https://futrix-frontend-xyz789.vercel.app/login`
3. Press Tab

**URI 3:**
1. Click **"+ ADD URI"** again
2. Paste: `https://futrix-frontend-xyz789.vercel.app/dashboard`
3. Press Tab

**Result:** You should have these redirect URIs:
- `http://localhost:5173` (existing)
- `http://localhost:5173/login` (existing)
- `https://futrix-frontend-xyz789.vercel.app`
- `https://futrix-frontend-xyz789.vercel.app/login`
- `https://futrix-frontend-xyz789.vercel.app/dashboard`

---

### 12.6: Save Changes
1. Scroll to bottom of page
2. Click **"SAVE"** button (blue button)
3. Wait for green message: "OAuth client updated"

---

### 12.7: Wait for Propagation
**IMPORTANT:** Google needs time to update their servers

**What to do:**
- Wait **2-3 minutes** before testing
- Set a timer on your phone
- Don't skip this step!

---

# PART 5: Final Testing

## Step 13: Test Backend Health

### 13.1: Test Health Endpoint
1. Open new browser tab
2. Go to: `https://futrix-backend-abc123.vercel.app/health`
3. Use YOUR backend URL

**Expected Result:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-02T12:34:56.789Z",
  "mongodb": "connected",
  "environment": "production"
}
```

✅ **Backend is healthy!**

---

## Step 14: Test Frontend Application

### 14.1: Open Frontend
1. Go to: `https://futrix-frontend-xyz789.vercel.app`
2. Use YOUR frontend URL

**Expected Result:**
- Login page loads
- "Sign in with Google" button visible
- No errors in browser console (press F12 to check)

---

### 14.2: Test Google OAuth Login
1. Click **"Sign in with Google"** button
2. Google popup should appear
3. Select your Google account
4. If asked, click **"Continue"** or **"Allow"**
5. You should be redirected to dashboard
6. You should see your name/email

✅ **Login works!**

---

### 14.3: Test Navigation
1. Try clicking different menu items
2. Try uploading a resume (if applicable)
3. Check if all features work

✅ **Everything works!**

---

# 🎉 Deployment Complete!

## Your Live Application URLs

**Backend API:** `https://futrix-backend-abc123.vercel.app`
**Frontend App:** `https://futrix-frontend-xyz789.vercel.app`

---

## 📝 Summary of What We Did

1. ✅ Created Vercel account with GitHub
2. ✅ Deployed backend (Node.js/Express) to Vercel
3. ✅ Added 7 environment variables to backend
4. ✅ Tested backend health endpoint
5. ✅ Deployed frontend (React/Vite) to Vercel
6. ✅ Added 2 environment variables to frontend
7. ✅ Updated backend FRONTEND_URL with production URL
8. ✅ Updated Google OAuth Console with production URLs
9. ✅ Tested complete application flow
10. ✅ Google OAuth login works!

---

# 🐛 Troubleshooting Guide

## Issue 1: Backend Returns 500 Error

**Symptoms:**
- Visiting backend URL shows "Serverless Function has crashed"
- `/health` endpoint doesn't work

**Causes:**
- Environment variables not set correctly
- MongoDB connection failed

**Fix:**
1. Go to Vercel dashboard → Backend project
2. Settings → Environment Variables
3. Verify all 7 variables are set
4. Check MONGO_URI is correct
5. Go to Deployments → Redeploy

---

## Issue 2: CORS Error in Browser Console

**Symptoms:**
- Login button doesn't work
- Console shows: "blocked by CORS policy"

**Causes:**
- Backend FRONTEND_URL doesn't match your frontend URL

**Fix:**
1. Go to backend project → Settings → Environment Variables
2. Check FRONTEND_URL value
3. Should be: `https://futrix-frontend-xyz789.vercel.app` (your exact frontend URL)
4. If wrong, edit it
5. Go to Deployments → Redeploy
6. Clear browser cache (Ctrl+Shift+Delete)
7. Try again

---

## Issue 3: API Calls Return 404

**Symptoms:**
- Frontend loads but API calls fail
- Console shows: `GET https://futrix-frontend.../api/... 404`

**Causes:**
- VITE_API_URL not set correctly in frontend

**Fix:**
1. Go to frontend project → Settings → Environment Variables
2. Check VITE_API_URL value
3. Should be: `https://futrix-backend-abc123.vercel.app` (NO `/api` at end)
4. If wrong or missing, add/edit it
5. Go to Deployments → Redeploy
6. Wait for deployment
7. Clear browser cache
8. Try again

---

## Issue 4: Google OAuth Error 403

**Symptoms:**
- Google popup shows error
- "The given origin is not allowed"

**Causes:**
- Google Console doesn't have production URLs

**Fix:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your OAuth 2.0 Client ID
3. Check "Authorized JavaScript origins" has your frontend URL
4. Check "Authorized redirect URIs" has all 3 frontend URLs
5. If missing, add them
6. Click SAVE
7. Wait 3-5 minutes for Google to propagate changes
8. Clear browser cache
9. Try in Incognito mode (Ctrl+Shift+N)

---

## Issue 5: Frontend Build Failed

**Symptoms:**
- Deployment shows red X
- Build logs show errors

**Causes:**
- Missing dependencies
- Build configuration wrong

**Fix:**
1. Go to frontend project → Settings → General
2. Check "Framework Preset" is set to **"Vite"**
3. Check "Root Directory" is set to **"client"**
4. Go to Settings → General → Build & Development Settings
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Go to Deployments → Redeploy

---

## Issue 6: MongoDB Connection Error

**Symptoms:**
- `/health` shows `"mongodb": "disconnected"`
- Backend logs show MongoDB errors

**Causes:**
- MongoDB Atlas network access not configured

**Fix:**
1. Go to: https://cloud.mongodb.com
2. Login to your account
3. Click **"Network Access"** in left sidebar
4. Click **"Add IP Address"**
5. Click **"Allow Access from Anywhere"**
6. Click **"Confirm"**
7. Go back to Vercel backend project
8. Deployments → Redeploy
9. Wait 2 minutes
10. Test `/health` again

---

## Issue 7: Environment Variables Not Working

**Symptoms:**
- Variables show as undefined in logs
- Features don't work

**Causes:**
- Variables added after deployment
- Deployment not redeployed after adding variables

**Fix:**
**Important:** Every time you add/edit environment variables, you MUST redeploy!

1. Go to project → Settings → Environment Variables
2. Verify all variables are set
3. Go to Deployments tab
4. Click three dots (⋯) on latest deployment
5. Click "Redeploy"
6. Wait for completion
7. Test again

---

# 🔄 How to Update Your App in the Future

## Update Backend Code

1. Make changes to code locally
2. Test locally: `npm start` in `node-api/` folder
3. Commit changes:
   ```bash
   git add .
   git commit -m "Update backend"
   git push origin main
   ```
4. Vercel **automatically redeploys** in 1-2 minutes
5. No manual action needed!

---

## Update Frontend Code

1. Make changes to code locally
2. Test locally: `npm run dev` in `client/` folder
3. Commit changes:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```
4. Vercel **automatically redeploys** in 3-5 minutes
5. No manual action needed!

---

## Update Environment Variables

1. Go to Vercel dashboard
2. Click on project (backend or frontend)
3. Settings → Environment Variables
4. Click "Edit" on the variable you want to change
5. Update the value
6. Click "Save"
7. **Go to Deployments → Redeploy** (IMPORTANT!)
8. Wait for deployment to complete

---

# 📚 Important Links

## Vercel
- **Dashboard:** https://vercel.com/dashboard
- **Documentation:** https://vercel.com/docs

## MongoDB Atlas
- **Dashboard:** https://cloud.mongodb.com

## Google Cloud
- **API Credentials:** https://console.cloud.google.com/apis/credentials

---

# ✅ Quick Reference - Your Deployment

**Fill this out after deployment:**

## Backend
- **Project Name:** futrix-backend
- **URL:** `https://futrix-backend-__________.vercel.app`
- **Health Check:** `https://futrix-backend-__________.vercel.app/health`

## Frontend
- **Project Name:** futrix-frontend
- **URL:** `https://futrix-frontend-__________.vercel.app`

## Environment Variables

### Backend (7 variables):
- MONGO_URI ✅
- JWT_SECRET ✅
- JWT_REFRESH_SECRET ✅
- GOOGLE_CLIENT_ID ✅
- GOOGLE_CLIENT_SECRET ✅
- NODE_ENV ✅
- FRONTEND_URL ✅

### Frontend (2 variables):
- VITE_GOOGLE_CLIENT_ID ✅
- VITE_API_URL ✅

## Google OAuth Console
- Authorized JavaScript origins ✅
- Authorized redirect URIs (3 production URLs) ✅

---

# 🎯 Next Steps

After successful deployment:

1. **Share your app:** Send the frontend URL to friends/clients
2. **Monitor:** Check Vercel dashboard for usage and errors
3. **Set up custom domain:** (Optional) Add your own domain in Vercel settings
4. **Enable analytics:** (Optional) Enable Vercel Analytics
5. **Set up monitoring:** (Optional) Add error tracking (Sentry, etc.)

---

# 💡 Pro Tips

1. **Always test locally first** before deploying
2. **Use environment variables** for all secrets - never hardcode
3. **Check build logs** if deployment fails
4. **Clear browser cache** when testing changes
5. **Use Incognito mode** to test without cached data
6. **Keep localhost URLs** in Google Console for local development
7. **Redeploy after** changing environment variables
8. **Wait 2-3 minutes** after updating Google Console

---

# 🆘 Need Help?

If you encounter errors:

1. **Check browser console** (F12 → Console tab)
2. **Check Vercel build logs** (Deployments → Click on deployment)
3. **Verify environment variables** are all set correctly
4. **Clear browser cache** and try again
5. **Try Incognito mode**
6. **Check MongoDB Atlas** is accessible
7. **Verify Google Console** has correct URLs

---

**🎉 Congratulations on deploying your full-stack application!** 🎉

**Your app is now live and accessible to the world!** 🌍
