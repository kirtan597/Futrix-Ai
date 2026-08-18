# Google OAuth Setup & Troubleshooting

## ✅ Current Configuration Status

### Frontend (`client/.env`)
```
VITE_GOOGLE_CLIENT_ID=424357134168-gtnpk168sp23oopec177581sb62vs6o0.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000
```

### Backend (`node-api/.env`)
```
GOOGLE_CLIENT_ID=424357134168-gtnpk168sp23oopec177581sb62vs6o0.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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HiJkLmNoPqRsT
```

**Status:** ✅ Client IDs are synchronized

---

## Google Cloud Console Setup

### Step 1: Create OAuth 2.0 Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Select **Web application**

### Step 2: Configure Authorized Origins

Under **Authorized JavaScript Origins**, add:

**Development:**
```
http://localhost:5173
http://localhost:3000
```

**Production:**
```
https://futrixai.netlify.app
https://your-frontend-domain.com
```

### Step 3: Configure Authorized Redirect URIs

Under **Authorized Redirect URIs**, add:

**Development:**
```
http://localhost:5173
http://localhost:5000
```

**Production:**
```
https://futrixai.netlify.app
https://your-frontend-domain.com
https://your-api-domain.com
```

### Step 4: Copy Credentials

- **Client ID:** Copy and paste into both `.env` files
- **Client Secret:** Copy and paste into `node-api/.env` only (never in frontend)

---

## How Google OAuth Works in This App

### Frontend Flow (React)

1. **`GoogleOAuthProvider` wrapper** (in `main.tsx`):
   ```typescript
   <GoogleOAuthProvider clientId={VITE_GOOGLE_CLIENT_ID}>
     <App />
   </GoogleOAuthProvider>
   ```

2. **`GoogleLogin` button** (in `Login.tsx`):
   ```typescript
   <GoogleLogin
     onSuccess={handleGoogleSuccess}
     onError={() => setError('Google login failed')}
   />
   ```

3. **Credential capture**:
   ```typescript
   const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
     const data = await apiService.publicRequest('/api/auth/google', {
       method: 'POST',
       body: JSON.stringify({ credential: credentialResponse.credential }),
     });
     // Use the returned JWT tokens
   }
   ```

### Backend Flow (Node.js)

1. **Receive credential**:
   ```javascript
   const { credential } = req.body;
   ```

2. **Verify with Google**:
   ```javascript
   const ticket = await googleClient.verifyIdToken({
     idToken: credential,
     audience: GOOGLE_CLIENT_ID,  // ← Must match frontend
   });
   ```

3. **Extract user info**:
   ```javascript
   const { email, sub, name, picture } = ticket.getPayload();
   ```

4. **Create or update user in MongoDB**:
   ```javascript
   let user = await User.findOne({ email });
   if (!user) {
     user = await User.create({ email, name, googleId: sub, avatar: picture });
   }
   ```

5. **Return JWT tokens**:
   ```javascript
   const { accessToken, refreshToken } = generateTokens(user);
   res.json({ accessToken, refreshToken, user });
   ```

---

## Troubleshooting

### Error: "idpiframe_initialization_failed"

**Cause:** Origin mismatch in Google Cloud Console

**Fix:**
1. Go to Google Cloud Console → Credentials
2. Find your OAuth 2.0 Client ID
3. Add your frontend URL to **Authorized JavaScript Origins**:
   - Development: `http://localhost:5173`
   - Production: `https://futrixai.netlify.app`
4. Wait 5-10 minutes for propagation
5. Hard refresh browser (Ctrl+Shift+R)

---

### Error: "Invalid Google token" or "audience mismatch"

**Cause:** Frontend and backend Client IDs don't match

**Fix:**
1. Copy the exact Client ID from Google Cloud Console
2. Update **both** files:
   - `client/.env` → `VITE_GOOGLE_CLIENT_ID=...`
   - `node-api/.env` → `GOOGLE_CLIENT_ID=...`
3. Restart both frontend and backend servers

---

### Error: "Email not verified"

**Cause:** User hasn't verified their email with Google

**Fix:**
1. Ask user to verify email in their Google account settings
2. Try logging in again

---

### Error: "System clock out of sync"

**Cause:** Server time doesn't match Google's servers

**Fix:**
1. Sync your computer's date/time:
   - **Windows:** Settings → Time & Language → Set time automatically
   - **Mac:** System Preferences → Date & Time
   - **Linux:** `sudo ntpdate -s time.nist.gov`
2. Try again

---

### Error: "Token used too late"

**Cause:** Token has expired (valid for ~10 minutes)

**Fix:**
- Just ask user to try logging in again

---

## Testing Google OAuth Locally

### Step 1: Start all services

```bash
# Terminal 1: Python AI
cd python-ai
python -m uvicorn main:app --host 0.0.0.0 --port 8000

# Terminal 2: Node API
cd node-api
npm run dev

# Terminal 3: Frontend
cd client
npm run dev
```

### Step 2: Test in browser

1. Visit `http://localhost:5173`
2. Click "Continue with Google"
3. Sign in with your Google account
4. Check browser console for errors
5. Check backend logs for token verification details

### Step 3: Check logs

**Frontend (Browser Console):**
```
[Futrix AI] VITE_GOOGLE_CLIENT_ID loaded
```

**Backend (Node.js terminal):**
```
[google-auth] Token verified successfully
[login] User found/created
[login] Tokens generated
```

---

## Debugging Checklist

- [ ] Google OAuth Client ID created in Google Cloud Console
- [ ] Client ID added to `client/.env` as `VITE_GOOGLE_CLIENT_ID`
- [ ] Client ID added to `node-api/.env` as `GOOGLE_CLIENT_ID`
- [ ] Client Secret added to `node-api/.env` as `GOOGLE_CLIENT_SECRET`
- [ ] `http://localhost:5173` added to Authorized JavaScript Origins
- [ ] `http://localhost:5173` added to Authorized Redirect URIs
- [ ] Frontend and backend IDs match exactly
- [ ] 5-10 minutes passed for Google to propagate changes
- [ ] Both servers restarted after .env changes
- [ ] Browser cache cleared (or hard refresh Ctrl+Shift+R)

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Update Google Cloud Console with production URLs
  - Add `https://futrixai.netlify.app` to Authorized JavaScript Origins
  - Add `https://futrix-node-api.onrender.com` to Authorized Redirect URIs
- [ ] Set environment variables on Render.com:
  - `GOOGLE_CLIENT_ID=...` (production value)
  - `GOOGLE_CLIENT_SECRET=...`
- [ ] Set environment variables on Netlify:
  - `VITE_GOOGLE_CLIENT_ID=...` (production value)
- [ ] Test on production URLs
- [ ] Verify redirect after login goes to `/dashboard`

---

## References

- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [React Google OAuth Library](https://www.npmjs.com/package/@react-oauth/google)
- [Google Auth Library for Node.js](https://github.com/googleapis/google-auth-library-nodejs)

---

**Last Updated:** August 18, 2026  
**Status:** ✅ Configured & Ready for Testing
