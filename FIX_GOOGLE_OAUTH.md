# Fix Google OAuth Login Issue

## 🔍 Problem: Page Refreshes After Google Login

When you click Google login and select your account, the page refreshes but you stay on the login page.

## ✅ Step-by-Step Fix

### Step 1: Check Google Cloud Console Configuration

Go to: https://console.cloud.google.com/apis/credentials

**Verify these settings:**

1. **Authorized JavaScript origins** must include:
   ```
   http://localhost:5173
   ```
   ⚠️ **NO trailing slash!**

2. **Authorized redirect URIs** must include:
   ```
   http://localhost:5173
   ```
   ⚠️ **NO trailing slash!**

3. **OAuth consent screen** must be configured:
   - App name: Career Twin AI
   - User support email: Your email
   - Developer contact: Your email

### Step 2: Test Backend is Running

Open a new terminal and run:

```bash
# Test backend health
curl http://localhost:5000/health

# Should return: {"status":"ok","timestamp":"...","mongodb":"connected"}
```

If this fails, your backend is not running. Start it:
```bash
cd node-api
npm start
```

### Step 3: Test OAuth Endpoint Directly

```bash
# This should return an error (no credential) but proves endpoint exists
curl -X POST http://localhost:5000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"credential":"test"}'

# Should return: {"error":"Google authentication failed",...}
```

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Sign in with Google"
4. Look for errors

**Common errors and fixes:**

#### Error: "redirect_uri_mismatch"
**Fix:** In Google Cloud Console, make sure you added:
- `http://localhost:5173` to Authorized JavaScript origins
- `http://localhost:5173` to Authorized redirect URIs

#### Error: "idpiframe_initialization_failed"
**Fix:** Clear browser cookies and cache, then try again

#### Error: "popup_closed_by_user"
**Fix:** This is normal if you close the popup. Try again.

#### Error: Network error or CORS
**Fix:** Make sure backend is running on port 5000

### Step 5: Test with Simple HTML File

I created a test file for you. Open it directly:

```bash
# Open in browser
start test-oauth.html
```

This will test Google OAuth without your React app. If this works, the issue is in the React integration.

### Step 6: Check Environment Variables

```bash
# Backend
cat node-api/.env | grep GOOGLE_CLIENT_ID

# Frontend  
cat client/.env | grep VITE_GOOGLE_CLIENT_ID

# Both should show the same Client ID!
```

### Step 7: Restart Everything

Sometimes you just need a fresh start:

```bash
# Stop all services (Ctrl+C in each terminal)

# Clear browser cache and cookies for localhost

# Restart services:
# Terminal 1
cd node-api
npm start

# Terminal 2
cd client
npm run dev

# Try login again
```

## 🐛 Debug Mode

I've added console.log statements to your Login.tsx. Now when you try Google login:

1. Open browser console (F12)
2. Click "Sign in with Google"
3. Select your account
4. Watch the console for messages:
   - "Google OAuth Response: ..."
   - "Sending credential to backend..."
   - "Backend response status: ..."
   - "Backend response data: ..."

**Share these console messages with me if it still doesn't work!**

## 🔧 Quick Fixes

### Fix 1: Client ID Mismatch

```bash
# Make sure both files have the SAME Client ID
echo "Backend: $(grep GOOGLE_CLIENT_ID node-api/.env)"
echo "Frontend: $(grep VITE_GOOGLE_CLIENT_ID client/.env)"
```

### Fix 2: MongoDB Not Running

```bash
# Start MongoDB
mongod

# Or if using Windows service:
net start MongoDB
```

### Fix 3: Port Already in Use

```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill the process if needed (replace PID with actual number)
taskkill /PID <PID> /F

# Restart backend
cd node-api
npm start
```

## 📋 Checklist

Before trying again, verify:

- [ ] MongoDB is running
- [ ] Backend is running on port 5000 (`curl http://localhost:5000/health`)
- [ ] Frontend is running on port 5173
- [ ] Google Client ID is in both .env files
- [ ] Google Cloud Console has `http://localhost:5173` (no trailing slash)
- [ ] Browser console is open to see errors
- [ ] Cookies/cache cleared

## 🎯 Alternative: Use Email Login

While debugging Google OAuth, you can use email login:

1. Go to http://localhost:5173/login
2. Enter any email: `test@example.com`
3. Click "Start Analysis"
4. Should work immediately!

## 📞 Still Not Working?

If it still doesn't work, do this:

1. Open browser console (F12)
2. Try Google login
3. Copy ALL console messages
4. Copy the error message shown on screen
5. Share with me

Also run this and share the output:

```bash
# Check services
curl http://localhost:5000/health
curl http://localhost:5173

# Check environment
echo "Backend Client ID:"
grep GOOGLE_CLIENT_ID node-api/.env

echo "Frontend Client ID:"
grep VITE_GOOGLE_CLIENT_ID client/.env
```

## 🔐 Google Cloud Console - Detailed Steps

If you need to reconfigure:

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to: APIs & Services → Credentials
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized JavaScript origins":
   - Click "ADD URI"
   - Enter: `http://localhost:5173`
   - Click "Save"
6. Under "Authorized redirect URIs":
   - Click "ADD URI"
   - Enter: `http://localhost:5173`
   - Click "Save"
7. Wait 5 minutes for changes to propagate
8. Try login again

---

**Most Common Issue:** Forgetting to add `http://localhost:5173` to BOTH "Authorized JavaScript origins" AND "Authorized redirect URIs" in Google Cloud Console.
