# OAuth Security Implementation Guide

## Overview
This document describes the secure OAuth 2.0 authentication system implemented in Career Twin AI.

## Features Implemented

### 1. Google OAuth Integration
- ✅ Google Sign-In with ID token verification
- ✅ Email verification check
- ✅ Secure token exchange
- ✅ User profile synchronization

### 2. JWT Token System
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for obtaining new access tokens
- Both tokens are signed with separate secrets for enhanced security

### 3. Security Features

#### Rate Limiting
- Login endpoints: 5 requests per 15 minutes
- Google OAuth: 10 requests per 15 minutes
- Prevents brute force attacks

#### Account Lockout
- Locks account after 5 failed login attempts
- Lockout duration: 2 hours
- Automatic reset on successful login

#### Token Refresh Mechanism
- Automatic token refresh on expiration
- Queues failed requests during refresh
- Seamless user experience

#### Secure Token Storage
- Refresh tokens stored in database
- Token validation on each refresh
- Logout invalidates refresh tokens

### 4. API Endpoints

#### POST /api/login
Email-based login with JWT generation
```json
Request: { "email": "user@example.com" }
Response: {
  "status": "logged_in",
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "...", "email": "...", "name": "...", "avatar": "..." }
}
```

#### POST /api/auth/google
Google OAuth login
```json
Request: { "credential": "google_id_token" }
Response: {
  "status": "logged_in",
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "...", "email": "...", "name": "...", "avatar": "..." }
}
```

#### POST /api/auth/refresh
Refresh access token
```json
Request: { "refreshToken": "..." }
Response: {
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### POST /api/auth/logout
Invalidate refresh token
```json
Response: {
  "status": "logged_out",
  "message": "Successfully logged out"
}
```

#### GET /api/auth/verify
Verify current access token
```json
Response: {
  "valid": true,
  "user": { "id": "...", "email": "...", "name": "...", "avatar": "..." }
}
```

## Environment Variables

### Backend (.env)
```env
# Database
MONGO_URI=mongodb://localhost:27017/futrixai

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Secrets (CHANGE THESE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# AI Service
AI_SERVICE_URL=http://localhost:8000/analyze
```

### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Setup Instructions

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
7. Add authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
8. Copy Client ID and add to `.env` files

### 2. Generate Secure JWT Secrets

```bash
# Generate random 32-character secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to generate both `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### 3. Install Dependencies

```bash
# Backend
cd node-api
npm install

# Frontend
cd ../client
npm install
```

### 4. Start Services

```bash
# Start MongoDB
mongod

# Start Node.js API (in node-api directory)
npm start

# Start React client (in client directory)
npm run dev
```

## Security Best Practices

### Production Deployment

1. **Use HTTPS**: Always use HTTPS in production
2. **Secure Secrets**: Use environment variable management (AWS Secrets Manager, Azure Key Vault, etc.)
3. **CORS Configuration**: Restrict CORS to specific domains
4. **Rate Limiting**: Consider using Redis for distributed rate limiting
5. **Token Storage**: Consider HTTP-only cookies for refresh tokens
6. **Monitoring**: Implement logging and monitoring for auth events
7. **Regular Updates**: Keep dependencies updated

### Token Expiration Times

Current settings:
- Access Token: 15 minutes
- Refresh Token: 7 days

Adjust based on your security requirements in `utils/authUtils.js`.

### Database Security

- Use strong MongoDB passwords
- Enable MongoDB authentication
- Use connection string with authentication
- Regular backups

## Frontend Integration

The frontend automatically handles:
- Token storage in localStorage
- Automatic token refresh on expiration
- Request queuing during refresh
- Redirect to login on auth failure

## Testing

### Test Google OAuth
1. Start all services
2. Navigate to `http://localhost:5173/login`
3. Click "Sign in with Google"
4. Verify successful login and redirect

### Test Token Refresh
1. Login successfully
2. Wait 15 minutes (or modify token expiration for testing)
3. Make an API request
4. Verify automatic token refresh

### Test Rate Limiting
1. Make 6 login requests within 15 minutes
2. Verify 429 error on 6th request

## Troubleshooting

### Google OAuth Errors

**"redirect_uri_mismatch"**
- Ensure authorized redirect URIs match exactly in Google Console

**"invalid_client"**
- Verify GOOGLE_CLIENT_ID is correct in both frontend and backend

**"Email not verified"**
- User must verify email with Google first

### Token Errors

**"Token Expired"**
- Normal behavior, frontend will auto-refresh
- Check refresh token is valid

**"Invalid refresh token"**
- User needs to login again
- Check JWT_REFRESH_SECRET matches

## Additional Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
