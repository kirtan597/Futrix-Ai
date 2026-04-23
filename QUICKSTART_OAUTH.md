# Quick Start: OAuth Setup

## 🚀 Fast Setup (5 minutes)

### Step 1: Run Setup Script
```bash
node setup-oauth.js
```

This will:
- Generate secure JWT secrets
- Create `.env` files for backend and frontend
- Guide you through Google OAuth configuration

### Step 2: Get Google OAuth Credentials (Optional but Recommended)

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Add authorized JavaScript origins:
   ```
   http://localhost:5173
   ```
7. Add authorized redirect URIs:
   ```
   http://localhost:5173
   ```
8. Copy the **Client ID** and paste it when running `setup-oauth.js`

### Step 3: Start Services

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend API
cd node-api
npm install  # First time only
npm start

# Terminal 3: Start Frontend
cd client
npm install  # First time only
npm run dev
```

### Step 4: Test It Out

1. Open browser: `http://localhost:5173/login`
2. Try Google Sign-In (if configured)
3. Or enter any email for demo login

## ✅ What You Get

- 🔐 Secure Google OAuth integration
- 🎫 JWT access tokens (15 min expiry)
- 🔄 Automatic token refresh
- 🛡️ Rate limiting on auth endpoints
- 🔒 Account lockout after failed attempts
- 📊 User session management

## 🔧 Manual Setup (Alternative)

If you prefer manual setup:

### Backend (.env)
```env
MONGO_URI=mongodb://localhost:27017/futrixai
PORT=5000
JWT_SECRET=your-secret-here-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000/analyze
```

### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Generate Secrets
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🐛 Troubleshooting

### "Cannot connect to server"
- Ensure Node.js API is running on port 5000
- Check MongoDB is running

### "Google login failed"
- Verify GOOGLE_CLIENT_ID matches in both .env files
- Check authorized origins in Google Console
- Ensure redirect URIs are configured

### "Token expired"
- This is normal! Frontend auto-refreshes tokens
- If refresh fails, you'll be redirected to login

### Rate limit errors
- Wait 15 minutes or restart the API server
- In production, use Redis for distributed rate limiting

## 📚 More Information

- Full documentation: `OAUTH_SECURITY.md`
- API endpoints and security features
- Production deployment guide
- Best practices

## 🎯 Testing Checklist

- [ ] Google OAuth login works
- [ ] Email login works
- [ ] Token refresh happens automatically
- [ ] Logout clears tokens
- [ ] Protected routes require authentication
- [ ] Rate limiting prevents spam

## 🚀 Production Deployment

Before deploying to production:

1. Generate new JWT secrets (never use dev secrets)
2. Enable HTTPS
3. Update Google OAuth authorized origins/redirects
4. Set `NODE_ENV=production`
5. Use secure MongoDB connection
6. Implement proper logging and monitoring
7. Consider HTTP-only cookies for refresh tokens

## 💡 Tips

- Access tokens expire in 15 minutes (configurable)
- Refresh tokens expire in 7 days (configurable)
- Failed login attempts lock account for 2 hours
- Rate limits: 5 logins per 15 min, 10 OAuth per 15 min

## 🆘 Need Help?

Check the detailed documentation in `OAUTH_SECURITY.md` or review the code:
- Backend auth: `node-api/routes/userRoutes.js`
- Frontend auth: `client/src/services/api.ts`
- Token utils: `node-api/utils/authUtils.js`
