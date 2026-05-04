# ✅ Quick Deployment Checklist

## 🎯 Before You Start

- [ ] MongoDB Atlas is set up and running
- [ ] Google OAuth credentials are ready
- [ ] Both backend and frontend work locally

---

## 📦 Files Ready for Deployment

### ✅ Removed:
- ❌ `netlify.toml` - Deleted

### ✅ Created:
- ✅ `vercel.json` - Root config
- ✅ `client/vercel.json` - Frontend config
- ✅ `node-api/vercel.json` - Backend config
- ✅ `VERCEL_DEPLOYMENT.md` - Full guide

### ✅ Updated:
- ✅ `client/src/services/api.ts` - Now supports VITE_API_URL

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend
```bash
cd "d:\Projects\AI career twin\career-twin-ai\node-api"
vercel --prod
```

**Add these environment variables in Vercel:**
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NODE_ENV` = `production`
- `FRONTEND_URL` = (add after frontend deployment)

**Copy backend URL:** `https://your-backend.vercel.app`

---

### Step 2: Deploy Frontend
```bash
cd "d:\Projects\AI career twin\career-twin-ai\client"
vercel --prod
```

**Add these environment variables in Vercel:**
- `VITE_GOOGLE_CLIENT_ID` = `YOUR_GOOGLE_CLIENT_ID`
- `VITE_API_URL` = `https://your-backend.vercel.app`

**Copy frontend URL:** `https://your-frontend.vercel.app`

---

### Step 3: Update Backend FRONTEND_URL

Go to backend Vercel project:
1. Settings → Environment Variables
2. Add/Update `FRONTEND_URL` = `https://your-frontend.vercel.app`
3. Redeploy backend

---

### Step 4: Update Google Console

Go to: https://console.cloud.google.com/apis/credentials

Click on your OAuth 2.0 Client ID

**Authorized JavaScript origins:**
```
https://your-frontend.vercel.app
```

**Authorized redirect URIs:**
```
https://your-frontend.vercel.app
https://your-frontend.vercel.app/login
https://your-frontend.vercel.app/dashboard
```

Click **SAVE**

---

### Step 5: Test

1. Open: `https://your-backend.vercel.app/health`
   - Should return: `{"status":"ok",...}`

2. Open: `https://your-frontend.vercel.app`
   - Should load login page

3. Click "Sign in with Google"
   - Should work!

---

## 📝 Environment Variables

### Backend:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend:
```
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=https://your-backend.vercel.app
```

---

## 🐛 If You Get Errors

**Send me:**
1. Error message
2. Screenshot of Vercel build logs
3. Which step you're on

I'll help you fix it immediately!

---

## ✅ You're Ready!

Everything is prepared for Vercel deployment. Start deploying and let me know if you encounter any errors!

**Good luck!** 🚀
