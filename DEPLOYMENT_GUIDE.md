# 🚀 Deployment Guide - Career Twin AI

## ✅ Pre-Push Checklist

Before pushing to Git, verify:

- [ ] `.env` files are in `.gitignore` ✅ (Already done!)
- [ ] No secrets in code
- [ ] `.env.example` files are updated
- [ ] Documentation is complete
- [ ] Code is tested locally

## 📦 What to Push

### ✅ SAFE to Push:
- All source code
- `.env.example` files (templates without real secrets)
- Documentation (*.md files)
- Configuration files (package.json, vite.config.ts, etc.)
- `.gitignore`

### ❌ NEVER Push:
- `.env` files (contain real secrets)
- `node_modules/`
- `__pycache__/`
- `dist/` or `build/`
- Database files
- Uploaded files

## 🔐 Secrets Management

### Development Secrets (Already in .env - NOT pushed):
```
JWT_SECRET=FutrixAiSuperSecretKey_32chars!!!
JWT_REFRESH_SECRET=FutrixAiRefreshSecretKey_32chars!!!
GOOGLE_CLIENT_ID=424357134168-036fatdul5hun7nqdk59j50pn5uijokd.apps.googleusercontent.com
```

### Production Secrets (Generate NEW ones):
```bash
# Generate new secrets for production
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🌐 Deployment Options

### Option 1: Netlify (Frontend Only) - CURRENT

Your frontend is already on: https://futrix-ai.netlify.app

**Update for OAuth:**
1. Go to Google Cloud Console
2. Add to Authorized JavaScript origins:
   ```
   https://futrix-ai.netlify.app
   ```
3. Add to Authorized redirect URIs:
   ```
   https://futrix-ai.netlify.app
   ```

**Netlify Environment Variables:**
```
VITE_GOOGLE_CLIENT_ID=your-client-id
VITE_API_URL=https://your-backend-url.com/api
```

### Option 2: Full Stack Deployment

#### Backend Options:

**A. Heroku**
```bash
# Install Heroku CLI
heroku create career-twin-api

# Set environment variables
heroku config:set JWT_SECRET=your-new-secret
heroku config:set JWT_REFRESH_SECRET=your-new-secret
heroku config:set GOOGLE_CLIENT_ID=your-client-id
heroku config:set MONGO_URI=your-mongodb-atlas-uri
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

**B. Railway**
```bash
# Install Railway CLI
railway init

# Set environment variables in Railway dashboard
# Deploy
railway up
```

**C. Render**
1. Connect GitHub repo
2. Add environment variables
3. Auto-deploys on push

#### Database: MongoDB Atlas (Free Tier)
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to backend environment variables

#### Python AI Service:
- Deploy to Railway, Render, or Heroku
- Update `AI_SERVICE_URL` in backend .env

## 📝 Git Commands

### First Time Push:
```bash
# Check what will be committed
git status

# Add all files (respects .gitignore)
git add .

# Commit with message
git commit -m "feat: Add OAuth 2.0 authentication with Google Sign-In"

# Push to GitHub
git push origin main
```

### Update Existing Repo:
```bash
git add .
git commit -m "feat: Implement secure OAuth authentication system"
git push
```

## 🔒 Production Security Checklist

Before deploying to production:

### Environment Variables
- [ ] Generate NEW JWT secrets (never use dev secrets)
- [ ] Use production MongoDB URI
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Update `GOOGLE_CLIENT_ID` if using different credentials

### Google OAuth
- [ ] Add production URLs to Google Cloud Console
- [ ] Test OAuth flow in production
- [ ] Verify redirect URIs work

### Backend
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain only
- [ ] Set up Redis for rate limiting (optional but recommended)
- [ ] Enable logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)

### Database
- [ ] Use MongoDB Atlas or managed database
- [ ] Enable authentication
- [ ] Set up backups
- [ ] Restrict network access

### Frontend
- [ ] Update API URL to production backend
- [ ] Enable production build optimizations
- [ ] Set up CDN (Netlify/Vercel handle this)
- [ ] Configure custom domain (optional)

## 🌍 Environment-Specific Configuration

### Development (localhost)
```env
# Backend
MONGO_URI=mongodb://localhost:27017/futrixai
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

# Frontend
VITE_API_URL=/api
VITE_GOOGLE_CLIENT_ID=your-dev-client-id
```

### Production
```env
# Backend
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/futrixai
FRONTEND_URL=https://futrix-ai.netlify.app
NODE_ENV=production

# Frontend
VITE_API_URL=https://your-backend.herokuapp.com/api
VITE_GOOGLE_CLIENT_ID=your-prod-client-id
```

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Production Setup                   │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Frontend (Netlify)                                  │
│  └─ https://futrix-ai.netlify.app                   │
│                                                       │
│  Backend (Heroku/Railway/Render)                     │
│  └─ https://career-twin-api.herokuapp.com           │
│                                                       │
│  Python AI (Heroku/Railway/Render)                   │
│  └─ https://career-twin-ai.herokuapp.com            │
│                                                       │
│  Database (MongoDB Atlas)                            │
│  └─ mongodb+srv://...                               │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## 🔄 CI/CD (Optional)

### GitHub Actions Example:
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "career-twin-api"
          heroku_email: "your-email@example.com"
```

## 📞 Post-Deployment Testing

After deployment:

1. **Test OAuth Flow:**
   ```bash
   # Visit production URL
   https://futrix-ai.netlify.app/login
   
   # Try Google Sign-In
   # Try Email Login
   ```

2. **Test API Endpoints:**
   ```bash
   curl https://your-backend.herokuapp.com/health
   ```

3. **Monitor Logs:**
   - Check Netlify logs
   - Check Heroku/Railway logs
   - Check MongoDB Atlas metrics

## 🐛 Common Deployment Issues

### Issue: OAuth doesn't work in production
**Fix:** Add production URL to Google Cloud Console

### Issue: CORS errors
**Fix:** Update `FRONTEND_URL` in backend .env

### Issue: Database connection fails
**Fix:** Check MongoDB Atlas network access and connection string

### Issue: Environment variables not working
**Fix:** Verify they're set in hosting platform dashboard

## 📚 Additional Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Heroku Docs](https://devcenter.heroku.com/)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)

---

## 🎯 Quick Deploy Commands

```bash
# 1. Commit changes
git add .
git commit -m "feat: Add OAuth authentication"

# 2. Push to GitHub
git push origin main

# 3. Deploy frontend (if using Netlify CLI)
cd client
netlify deploy --prod

# 4. Deploy backend (if using Heroku)
cd node-api
git push heroku main
```

---

**Remember:** Always test in production after deployment!
