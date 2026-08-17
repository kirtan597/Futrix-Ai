# 🔧 Render Environment Variables Setup

## ⚠️ CRITICAL: Fix for 500 Errors

The 500 errors are caused by **missing environment variables on Render**. The Node API needs to know where the Python AI service is deployed.

---

## 🚀 Node API Setup (futrix-node-api)

Go to: https://dashboard.render.com → Select `futrix-node-api` service

### Environment Variables to Add:

| Variable | Value | Notes |
|----------|-------|-------|
| `PYTHON_URL` | `https://futrix-python-ai.onrender.com` | Deploy URL of Python AI service |
| `MONGO_URI` | Your MongoDB Atlas connection string | From MongoDB dashboard |
| `JWT_SECRET` | Your JWT secret key | Keep secure, random value |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret | From Google Cloud Console |
| `NODE_ENV` | `production` | Production environment |
| `FRONTEND_URL` | `https://futrixai.netlify.app` | Frontend URL for CORS |
| `PORT` | `5000` | Default port |

### Critical Settings:
- **PYTHON_URL**: Must point to deployed Python service (NOT localhost)
  - Format: `https://futrix-python-ai.onrender.com`
  - This is the root cause of 500 errors!
- **MONGO_URI**: Get from MongoDB Atlas → Connect → Connection String
- **NODE_ENV**: Must be `production` for proper error handling

### Steps to Set Variables:
1. Go to Render dashboard: https://dashboard.render.com
2. Click on `futrix-node-api` service
3. Go to "Environment" tab
4. Add each variable from table above
5. Click "Save"
6. Service will auto-redeploy

---

## 🐍 Python AI Setup (futrix-python-ai)

Go to: https://dashboard.render.com → Select `futrix-python-ai` service

### Environment Variables to Add:

| Variable | Value |
|----------|-------|
| `ALLOWED_ORIGINS` | `https://futrixai.netlify.app,https://futrix-node-api.onrender.com` |

### Steps:
1. Go to Render dashboard: https://dashboard.render.com
2. Click on `futrix-python-ai` service
3. Go to "Environment" tab
4. Add `ALLOWED_ORIGINS` variable
5. Click "Save"
6. Service will auto-redeploy

---

## ✅ Verification After Setup

### Check Node API Health:
```
GET https://futrix-node-api.onrender.com/health
```

Expected response (status 200):
```json
{
  "status": "ok",
  "mongodb": "connected",
  "services": {
    "python_ai": "configured"
  }
}
```

### If Response Shows 503:
- PYTHON_URL is not configured correctly
- Check the PYTHON_URL environment variable in Render dashboard
- Ensure Python service URL is correct

---

## 🔍 Troubleshooting

### 500 errors when uploading resume:
1. Verify PYTHON_URL is set to deployed service (not localhost)
2. Check Python service is running on Render
3. Check MongoDB URI credentials are correct
4. Review Render service logs for specific errors

### Python service connection fails:
1. Go to Render dashboard
2. Verify Python service is deployed and running
3. Check service logs for errors
4. Ensure PYTHON_URL uses correct `.onrender.com` domain
5. Wait 30-60 seconds for cold start on free tier

### MongoDB connection failed:
1. Verify MONGO_URI is copied correctly from MongoDB Atlas
2. Check username and password in connection string
3. Add Render IP to MongoDB Atlas Network Access (0.0.0.0/0 for testing)
4. Check MongoDB Atlas logs for connection attempts

---

## 📋 How to Find Service URLs

### Node API URL:
- Go to: https://dashboard.render.com
- Click `futrix-node-api`
- URL shown in "Settings" section
- Format: `https://futrix-node-api.onrender.com`

### Python AI URL:
- Go to: https://dashboard.render.com
- Click `futrix-python-ai`
- URL shown in "Settings" section
- Format: `https://futrix-python-ai.onrender.com`

---

## 🔐 Security Best Practices

⚠️ **Never commit secrets to git repositories**

- Keep all credentials in Render environment variables only
- Do NOT commit `.env` files with real secrets
- Use `.gitignore` to exclude `.env` files
- Rotate secrets regularly for production

---

## 📊 Root Cause of 500 Errors

### ❌ The Problem:
The code had `PYTHON_URL` hardcoded to `http://localhost:8000`

On Render production:
- Python service runs in separate container
- localhost doesn't work (different container = different localhost)
- API calls to Python service fail with connection refused
- Returns generic 500 error to client

### ✅ The Solution:
1. Make `PYTHON_URL` configurable via environment variable
2. Add validation to check if configured
3. Return clear error if not configured (503 instead of 500)
4. Better error logging for debugging

---

## 🚀 Deployment Timeline

After setting environment variables:

1. **Immediately**: Services auto-redeploy (Render detects env var changes)
2. **2-3 minutes**: Deployment completes
3. **Test health endpoint**: Should return 200 OK
4. **Try uploading**: Should work without 500 errors

---

## 📝 Step-by-Step Quick Start

### For Node API:
```
1. Open: https://dashboard.render.com
2. Click: futrix-node-api
3. Go to: Environment tab
4. Add: PYTHON_URL = https://futrix-python-ai.onrender.com
5. Add: Other variables from table
6. Click: Save
7. Wait: 2-3 minutes for redeploy
```

### For Python AI:
```
1. Open: https://dashboard.render.com
2. Click: futrix-python-ai
3. Go to: Environment tab
4. Add: ALLOWED_ORIGINS = https://futrixai.netlify.app,https://futrix-node-api.onrender.com
5. Click: Save
6. Wait: 1-2 minutes for redeploy
```

### Verify:
```
1. Go to: https://futrixai.netlify.app
2. Try uploading a resume
3. Check browser console (F12) for errors
4. Should work without 500 errors
```

---

## 💡 Why This Fixes 500 Errors

**Before:**
- API hardcoded to localhost
- On Render, localhost unreachable
- Every upload → 500 error

**After:**
- API reads PYTHON_URL from environment
- Set to deployed Python service URL
- Proper error handling for failures
- Clear status codes (503 for service unavailable, not 500)

---

## 📞 Still Getting Errors?

1. **Check Render logs:**
   - Go to service → Logs tab
   - Look for error messages

2. **Common issues:**
   - "PYTHON_URL not configured" → Set env var
   - "Connection refused" → Python service not running
   - "MongoDB connection error" → Check MONGO_URI

3. **Verify health endpoint:**
   ```
   curl https://futrix-node-api.onrender.com/health
   ```

---

**This fix resolves all 500 errors!** ✅

After setting the environment variables on Render, the upload-resume endpoint will work correctly.

