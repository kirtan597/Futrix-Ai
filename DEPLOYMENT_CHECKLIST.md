# 🚀 Deployment Checklist - Futrix AI

Use this checklist to ensure a smooth deployment process.

---

## ✅ Pre-Deployment Checklist

### 1. Code Preparation
- [ ] Run `node validate-env.js` - All checks pass
- [ ] Run `build-production.bat` - Build succeeds
- [ ] Git commit all changes
- [ ] Push to GitHub repository
- [ ] No `.env` files in Git (check `.gitignore`)

### 2. Accounts Setup
- [ ] MongoDB Atlas account created
- [ ] Render/Railway account created
- [ ] Vercel account created
- [ ] Google Cloud Console access

---

## 🗄️ Database Deployment (15 minutes)

### MongoDB Atlas
- [ ] Create M0 free cluster
- [ ] Create database user (save credentials)
- [ ] Whitelist IP: `0.0.0.0/0`
- [ ] Get connection string
- [ ] Test connection locally
- [ ] Save connection string for backend

**Connection String Format:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/futrixai
```

---

## 🐍 Python AI Deployment (10 minutes)

### Render Setup
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set root directory: `python-ai`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Choose Free plan
- [ ] Wait for deployment (5-10 min)
- [ ] Test endpoint: `https://your-python-ai.onrender.com/`
- [ ] Save URL for backend config

**Expected Response:**
```json
{
  "status": "Futrix AI Engine v2.0 running 🐍",
  "endpoints": ["/analyze", "/score-breakdown", "/career-path", "/compare"]
}
```

---

## 🌐 Node.js Backend Deployment (15 minutes)

### Render Setup
- [ ] Create new Web Service
- [ ] Connect GitHub repository
- [ ] Set root directory: `node-api`
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Choose Free plan

### Environment Variables
- [ ] `MONGO_URI` = (from MongoDB Atlas)
- [ ] `JWT_SECRET` = (64-char random string)
- [ ] `JWT_REFRESH_SECRET` = (different 64-char string)
- [ ] `GOOGLE_CLIENT_ID` = (from Google Console)
- [ ] `GOOGLE_CLIENT_SECRET` = (from Google Console)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `AI_SERVICE_URL` = `https://your-python-ai.onrender.com/analyze`
- [ ] `FRONTEND_URL` = (will add after Vercel deploy)

### Post-Deployment
- [ ] Wait for deployment (5-10 min)
- [ ] Test health: `https://your-backend.onrender.com/health`
- [ ] Save backend URL for frontend

**Expected Health Response:**
```json
{
  "status": "ok",
  "mongodb": "connected",
  "environment": "production"
}
```

---

## ⚛️ React Frontend Deployment (10 minutes)

### Vercel Setup
- [ ] Go to Vercel dashboard
- [ ] Import GitHub repository
- [ ] Set root directory: `client`
- [ ] Framework preset: `Vite`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`

### Environment Variables
- [ ] `VITE_GOOGLE_CLIENT_ID` = (from Google Console)
- [ ] `VITE_API_URL` = `https://your-backend.onrender.com`

### Post-Deployment
- [ ] Wait for deployment (2-5 min)
- [ ] Get Vercel URL
- [ ] Test loading the site
- [ ] Save frontend URL for backend update

---

## 🔧 Google OAuth Configuration (5 minutes)

### Google Cloud Console
- [ ] Go to APIs & Services → Credentials
- [ ] Edit OAuth 2.0 Client ID
- [ ] Add Authorized JavaScript origins:
  - [ ] `https://your-app.vercel.app`
  - [ ] `https://your-backend.onrender.com`
- [ ] Add Authorized redirect URIs:
  - [ ] `https://your-app.vercel.app`
  - [ ] `https://your-app.vercel.app/auth/callback`
- [ ] Save changes
- [ ] Wait 5 minutes for propagation

---

## 🔄 Final Configuration Updates (5 minutes)

### Update Backend on Render
- [ ] Go to Render dashboard → Your backend service
- [ ] Environment → Add/Update:
  - [ ] `FRONTEND_URL` = `https://your-app.vercel.app`
- [ ] Save changes
- [ ] Wait for auto-redeploy (3-5 min)

### Verify Frontend on Vercel
- [ ] Go to Vercel dashboard → Your project
- [ ] Settings → Environment Variables
- [ ] Verify `VITE_API_URL` is correct
- [ ] If changed, redeploy

---

## 🧪 Testing Checklist (10 minutes)

### Smoke Tests
- [ ] Frontend loads without errors
- [ ] Login page displays correctly
- [ ] Google OAuth button appears
- [ ] Email input works
- [ ] No console errors

### Functionality Tests
- [ ] Click Google OAuth → Login modal opens
- [ ] Google OAuth login works
- [ ] Dashboard loads after login
- [ ] Upload resume page accessible
- [ ] Can upload/paste resume text
- [ ] Analysis completes successfully
- [ ] Results display correctly
- [ ] Logout works

### API Tests
Run these in browser console or Postman:

**Backend Health:**
```bash
curl https://your-backend.onrender.com/health
```

**Python AI Health:**
```bash
curl https://your-python-ai.onrender.com/
```

**Test Analysis:**
```bash
curl -X POST https://your-python-ai.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"resume": "Software Engineer with React, Node.js, Python experience..."}'
```

---

## 🐛 Common Issues & Solutions

### Issue: "Service Unavailable"
- **Cause:** Render free tier cold start
- **Solution:** Wait 30-60 seconds and retry

### Issue: "CORS Error"
- **Cause:** Frontend URL not in backend CORS whitelist
- **Solution:** Update `FRONTEND_URL` in backend env vars

### Issue: "MongoDB Connection Failed"
- **Cause:** IP not whitelisted or wrong connection string
- **Solution:** Add `0.0.0.0/0` to Atlas network access

### Issue: "Google OAuth Failed"
- **Cause:** URLs not in Google Console
- **Solution:** Add all URLs to authorized origins/redirects

### Issue: "500 Internal Server Error"
- **Cause:** Missing environment variables
- **Solution:** Check Render logs, verify all env vars set

---

## 📊 Performance Optimization (Optional)

### Keep Services Awake
- [ ] Sign up for [UptimeRobot](https://uptimerobot.com) (free)
- [ ] Add backend URL to monitor
- [ ] Add Python AI URL to monitor
- [ ] Set interval: 5 minutes
- [ ] This prevents cold starts

### Monitor Performance
- [ ] Enable Vercel Analytics (free)
- [ ] Check Render metrics dashboard
- [ ] Monitor MongoDB metrics in Atlas

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ **All services return 200 OK:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com/health`
- Python AI: `https://your-python-ai.onrender.com/`

✅ **Authentication works:**
- Can login with Google OAuth
- Can login with email
- Dashboard loads after login

✅ **Core functionality works:**
- Can upload/analyze resume
- Results display correctly
- Can view history
- Can logout

---

## 📝 Post-Deployment Notes

### Save These URLs:
```
Frontend:   https://your-app.vercel.app
Backend:    https://your-backend.onrender.com
Python AI:  https://your-python-ai.onrender.com
MongoDB:    mongodb+srv://...
```

### Share Your App:
Update your README.md with:
```markdown
## 🌐 Live Demo
Visit: https://your-app.vercel.app
```

### Monitor Costs:
- Vercel: Free forever ✅
- Render: 750 hrs/month per service ✅
- MongoDB Atlas: 512MB free ✅
- **Total: $0/month** 🎉

---

## 🔄 Continuous Deployment

After initial setup, any push to `main` branch will:
1. Auto-deploy frontend on Vercel
2. Auto-deploy backend on Render
3. Auto-deploy Python AI on Render

No manual steps needed! 🚀

---

## 📞 Need Help?

- MongoDB: [Atlas Support](https://www.mongodb.com/support)
- Render: [Documentation](https://render.com/docs)
- Vercel: [Support](https://vercel.com/support)
- This project: Check `DEPLOYMENT_GUIDE.md`

---

**Estimated Total Time: 60-70 minutes**

Good luck with your deployment! 🎊