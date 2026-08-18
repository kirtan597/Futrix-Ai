# Troubleshooting 503 "Analysis Service Unavailable" Errors

When you see this error on the frontend:
```
"Analysis service is temporarily unavailable. Please try again shortly."
```

This means the **Node API cannot reach the Python AI service**. Follow these steps to fix it.

## Quick Diagnosis

### Step 1: Check if services are deployed

Run the diagnostic script:

```bash
# For local testing
node diagnose.js http://localhost:5000 http://localhost:8000

# For production
node diagnose.js https://futrix-node-api.onrender.com https://futrix-python-ai.onrender.com
```

This will tell you which services are online and which are down.

---

## Common Issues & Solutions

### Issue 1: Python AI Service Not Deployed

**Symptom:** Diagnostic shows `❌ Python AI FAILED`

**Solution:**
1. Go to [Render.com](https://render.com) dashboard
2. Create a new Web Service for Python AI:
   - Connect your GitHub repo
   - Root Directory: `python-ai`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Environment: (no vars needed)
   - Deploy

3. Wait ~2-3 minutes for deployment
4. Copy the service URL (e.g., `https://futrix-python-ai.onrender.com`)
5. Set it in Node API env vars (see Step 2 below)

---

### Issue 2: PYTHON_URL Not Set in Node API

**Symptom:** Logs show `❌ PYTHON_URL not configured`

**Solution:**

#### If using render.yaml (recommended):

The `render.yaml` should automatically inject `PYTHON_URL`. If it's not working:

1. Go to Render dashboard
2. Select `futrix-node-api`
3. Click "Environment"
4. Check if `PYTHON_URL` exists
5. If not, manually add it:
   - Key: `PYTHON_URL`
   - Value: `https://futrix-python-ai.onrender.com`
6. Redeploy Node API

#### If deploying manually:

1. Go to Node API settings on Render
2. Add environment variable:
   ```
   PYTHON_URL=https://futrix-python-ai.onrender.com
   ```
3. Redeploy

---

### Issue 3: Services Online but Still Getting 503

**Symptom:** Diagnostic shows both services ✅, but resume upload fails

**Possible Cause 1: Timeout**

The analysis might be taking longer than expected.

**Solution:**
- Try uploading a shorter resume (just 50-100 chars)
- If short one works, your resume is too complex
- Edit `node-api/routes/userRoutes.js` and increase timeout:

```javascript
// In callAIServiceWithRetry function, change:
const timeout = attempt === 1 ? 120_000 : 60_000;
// To:
const timeout = attempt === 1 ? 180_000 : 90_000; // 3 mins first attempt
```

**Possible Cause 2: Python Service Cold Start**

Render services go to sleep after 15 mins of inactivity.

**Solution:**
1. Check Node API logs for message like "ECONNREFUSED"
2. Wait a few seconds and try again (waking up the service)
3. Or manually visit Python service URL in browser to wake it up:
   ```
   https://futrix-python-ai.onrender.com/health
   ```

**Possible Cause 3: MongoDB Connection Issue**

Python AI might fail to return data if something else is down.

**Solution:**
1. Check Node API logs for detailed error
2. Look for `[AI-Service]` entries showing the actual error
3. Verify MongoDB connection works:
   ```bash
   curl https://futrix-node-api.onrender.com/health
   ```

---

### Issue 4: "Python AI is configured but not reachable"

**Symptom:** `PYTHON_URL` is set, but Node API can't connect

**Possible Causes:**
- Python service is crashed/restarting
- URL is incorrect
- Network/firewall issue
- Render auto-scaling delay

**Solution:**
1. Check Python service status on Render dashboard
2. Look at Python service logs for errors
3. Try restarting the service:
   - Render dashboard → futrix-python-ai → Manual Deploy
4. Verify URL is correct (no trailing slash)
5. Wait 3-5 minutes if service is restarting

---

## Checking Logs

### Node API Logs

On Render.com:
1. Dashboard → `futrix-node-api`
2. Click "Logs" tab
3. Look for `[AI-Service]` entries
4. Look for lines showing:
   - Connection errors
   - Timeouts
   - Response from Python service

Example good log:
```
[AI-Service] Attempt 1/5 to https://futrix-python-ai.onrender.com/analyze
[AI-Service] ✅ Success on attempt 1
```

Example bad log:
```
[AI-Service] Attempt 1/5 to https://futrix-python-ai.onrender.com/analyze
[AI-Service] ❌ Attempt 1/5: type: ECONNREFUSED
[AI-Service] ❌ Attempt 2/5: type: ECONNREFUSED
[upload-resume] Analysis service unavailable
```

### Python AI Logs

On Render.com:
1. Dashboard → `futrix-python-ai`
2. Click "Logs" tab
3. Look for:
   - Service startup messages
   - Error traces
   - Request processing logs

---

## Local Testing (if developing locally)

### Start services in this order:

```bash
# Terminal 1: Start Python AI
cd python-ai
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2: Start Node API
cd node-api
npm run dev

# Terminal 3: Test
node diagnose.js http://localhost:5000 http://localhost:8000
```

### Then test in browser:
1. Go to http://localhost:5173
2. Log in
3. Upload a resume
4. Check browser Network tab and server logs

---

## If Still Not Working

### Step 1: Verify render.yaml is correct

The file should look like:
```yaml
services:
  - type: web
    name: futrix-node-api
    runtime: node
    rootDir: node-api
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: PYTHON_URL
        fromService:
          name: futrix-python-ai
          type: web
          property: host
  
  - type: web
    name: futrix-python-ai
    runtime: python
    rootDir: python-ai
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Step 2: Manual deployment

If render.yaml linking isn't working:

1. **Deploy Python AI first:**
   - Render → New Web Service
   - Connect GitHub
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root Dir: `python-ai`
   - Deploy and note the URL

2. **Deploy Node API:**
   - Render → New Web Service
   - Build: `npm install`
   - Start: `node server.js`
   - Root Dir: `node-api`
   - Add environment variables (including PYTHON_URL from step 1)
   - Deploy

### Step 3: Test each service individually

```bash
# Test Node API
curl https://futrix-node-api.onrender.com/health

# Test Python AI
curl https://futrix-python-ai.onrender.com/health
```

Both should return HTTP 200 with JSON.

---

## Performance Optimization

If services work but are slow:

### Node API takes >1 second:
- Might be MongoDB query
- Check MongoDB Atlas connection limits
- Consider upgrading MongoDB plan

### Python AI takes >15 seconds:
- First cold start is expected (can be 30-60s)
- Subsequent calls should be faster
- Check if resume is too long (>5000 chars)
- Limit resume analysis to first 2000 chars in `python-ai/main.py`

### Add caching:
In Node API, cache analyses by resume text hash to avoid re-analyzing identical resumes.

---

## Permanent Fix Checklist

After fixing 503 errors, ensure:

- [ ] Both services deployed to Render
- [ ] `PYTHON_URL` set correctly in Node API
- [ ] Services can reach each other (test with curl)
- [ ] Logs show no connection errors
- [ ] Frontend receives analysis results
- [ ] Mobile app works
- [ ] Can save analysis to MongoDB

---

## Getting Help

If still stuck:

1. **Check all logs:**
   - Browser console (F12)
   - Node API logs on Render
   - Python AI logs on Render

2. **Run diagnostics:**
   ```bash
   node diagnose.js <node-url> <python-url>
   ```

3. **Share with support:**
   - Screenshot of diagnostic output
   - Error message from browser console
   - Relevant log entries from Render dashboard

---

**Last Updated:** August 2024  
**Version:** 2.0.1
