# OAuth Testing Guide

## 🧪 Testing Your OAuth Implementation

This guide helps you test the OAuth authentication system to ensure everything works correctly.

## Prerequisites

Before testing, ensure:
- MongoDB is running
- Node.js API is running on port 5000
- React client is running on port 5173
- Google OAuth credentials are configured (optional for email login)

## Test Scenarios

### 1. Email-Based Login

#### Test Case: Successful Login
```bash
# Using curl
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Expected Response:**
```json
{
  "status": "logged_in",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": null,
    "avatar": null
  }
}
```

#### Test Case: Invalid Email
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}'
```

**Expected Response:**
```json
{
  "error": "A valid email is required."
}
```

### 2. Google OAuth Login

#### Test Case: Frontend Flow
1. Open browser: `http://localhost:5173/login`
2. Click "Sign in with Google"
3. Complete Google authentication
4. Verify redirect to dashboard
5. Check localStorage for tokens:
   ```javascript
   localStorage.getItem('accessToken')
   localStorage.getItem('refreshToken')
   localStorage.getItem('userEmail')
   ```

### 3. Token Refresh

#### Test Case: Automatic Refresh
```bash
# 1. Login and save tokens
ACCESS_TOKEN="your-access-token"
REFRESH_TOKEN="your-refresh-token"

# 2. Wait 15 minutes (or modify token expiry for testing)

# 3. Make an API call - should auto-refresh
curl -X GET http://localhost:5000/api/history?email=test@example.com \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### Test Case: Manual Refresh
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'
```

**Expected Response:**
```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token"
}
```

### 4. Token Verification

#### Test Case: Verify Valid Token
```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer your-access-token"
```

**Expected Response:**
```json
{
  "valid": true,
  "user": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "avatar": "https://...",
    "lastLogin": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Test Case: Verify Invalid Token
```bash
curl -X GET http://localhost:5000/api/auth/verify \
  -H "Authorization: Bearer invalid-token"
```

**Expected Response:**
```json
{
  "error": "Invalid Token",
  "message": "..."
}
```

### 5. Logout

#### Test Case: Successful Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer your-access-token"
```

**Expected Response:**
```json
{
  "status": "logged_out",
  "message": "Successfully logged out"
}
```

### 6. Rate Limiting

#### Test Case: Exceed Rate Limit
```bash
# Make 6 login requests within 15 minutes
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  echo "\nRequest $i completed"
done
```

**Expected Response (6th request):**
```json
{
  "error": "Too Many Requests",
  "message": "Maximum 5 requests per 15 minutes. Please try again later.",
  "retryAfter": 900
}
```

### 7. Protected Routes

#### Test Case: Access Without Token
```bash
curl -X POST http://localhost:5000/api/upload-resume \
  -H "Content-Type: application/json" \
  -d '{"text":"Resume text","email":"test@example.com"}'
```

**Expected Response:**
```json
{
  "error": "Access Denied",
  "message": "No token provided"
}
```

#### Test Case: Access With Valid Token
```bash
curl -X POST http://localhost:5000/api/upload-resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-access-token" \
  -d '{"text":"Resume text with React JavaScript Node.js skills","email":"test@example.com"}'
```

**Expected Response:**
```json
{
  "skills": ["React", "JavaScript", "Node.js"],
  "readiness_score": 75,
  ...
}
```

### 8. Account Lockout

#### Test Case: Multiple Failed Attempts
This is harder to test with email login (no password), but you can test with invalid tokens:

```bash
# Make 6 requests with invalid tokens
for i in {1..6}; do
  curl -X GET http://localhost:5000/api/auth/verify \
    -H "Authorization: Bearer invalid-token-$i"
  echo "\nAttempt $i"
done
```

## Browser Testing

### Using Browser DevTools

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Login via UI**
4. **Inspect requests:**
   - Check request headers (Authorization)
   - Check response data
   - Verify status codes

### Check localStorage

```javascript
// In browser console
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));
console.log('User Email:', localStorage.getItem('userEmail'));
console.log('User Name:', localStorage.getItem('userName'));
console.log('User Avatar:', localStorage.getItem('userAvatar'));
```

### Test Token Expiration

```javascript
// In browser console - decode JWT to check expiration
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
}

const token = localStorage.getItem('accessToken');
const decoded = parseJwt(token);
console.log('Token expires at:', new Date(decoded.exp * 1000));
console.log('Time until expiry:', (decoded.exp * 1000 - Date.now()) / 1000 / 60, 'minutes');
```

## Automated Testing

### Using Postman

1. **Import Collection:**
   - Create a new collection "Career Twin OAuth"
   - Add environment variables:
     - `baseUrl`: `http://localhost:5000`
     - `accessToken`: (will be set automatically)
     - `refreshToken`: (will be set automatically)

2. **Create Requests:**

   **Login:**
   ```
   POST {{baseUrl}}/api/login
   Body: {"email": "test@example.com"}
   Tests:
   pm.test("Status is 200", () => pm.response.to.have.status(200));
   pm.test("Has access token", () => pm.expect(pm.response.json().accessToken).to.exist);
   pm.environment.set("accessToken", pm.response.json().accessToken);
   pm.environment.set("refreshToken", pm.response.json().refreshToken);
   ```

   **Verify Token:**
   ```
   GET {{baseUrl}}/api/auth/verify
   Headers: Authorization: Bearer {{accessToken}}
   Tests:
   pm.test("Token is valid", () => pm.expect(pm.response.json().valid).to.be.true);
   ```

### Using Jest (Node.js)

Create `node-api/tests/auth.test.js`:

```javascript
const request = require('supertest');
const app = require('../server');

describe('Authentication', () => {
  let accessToken;
  let refreshToken;

  test('POST /api/login - should login with email', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'test@example.com' });
    
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('logged_in');
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    
    accessToken = res.body.accessToken;
    refreshToken = res.body.refreshToken;
  });

  test('GET /api/auth/verify - should verify valid token', async () => {
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
  });

  test('POST /api/auth/refresh - should refresh token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });
});
```

## Common Issues & Solutions

### Issue: "Cannot connect to server"
**Solution:** Ensure Node.js API is running on port 5000

### Issue: "Google login failed"
**Solution:** 
- Check GOOGLE_CLIENT_ID in both .env files
- Verify authorized origins in Google Console
- Ensure redirect URIs are configured

### Issue: "Token expired" immediately
**Solution:**
- Check system time is correct
- Verify JWT_SECRET matches between services
- Check token expiration settings in authUtils.js

### Issue: Rate limit errors during testing
**Solution:**
- Wait 15 minutes
- Restart API server to clear in-memory rate limits
- Use different IP addresses for testing

### Issue: "Invalid refresh token"
**Solution:**
- Ensure JWT_REFRESH_SECRET is set correctly
- Check token hasn't been invalidated by logout
- Verify token hasn't expired (7 days)

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test login endpoint
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:5000/api/login

# login.json content:
# {"email":"test@example.com"}
```

### Monitor Response Times

```bash
# Using curl with timing
curl -w "@curl-format.txt" -o /dev/null -s \
  -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# curl-format.txt content:
# time_namelookup:  %{time_namelookup}\n
# time_connect:  %{time_connect}\n
# time_starttransfer:  %{time_starttransfer}\n
# time_total:  %{time_total}\n
```

## Security Testing

### Test SQL Injection (Should be prevented)
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com OR 1=1"}'
```

### Test XSS (Should be sanitized)
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert(1)</script>@example.com"}'
```

## Checklist

- [ ] Email login works
- [ ] Google OAuth login works
- [ ] Token refresh works automatically
- [ ] Token verification works
- [ ] Logout invalidates tokens
- [ ] Rate limiting prevents spam
- [ ] Protected routes require authentication
- [ ] Invalid tokens are rejected
- [ ] Expired tokens trigger refresh
- [ ] Error messages are appropriate
- [ ] No sensitive data in error messages
- [ ] CORS is configured correctly
- [ ] All endpoints return correct status codes

---

**Happy Testing!** 🧪

For issues or questions, refer to [OAUTH_SECURITY.md](OAUTH_SECURITY.md) or [QUICKSTART_OAUTH.md](QUICKSTART_OAUTH.md).
