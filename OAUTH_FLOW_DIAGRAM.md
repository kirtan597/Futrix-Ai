# OAuth Authentication Flow Diagrams

## 🔐 Complete Authentication Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Career Twin AI OAuth System                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   React      │      │   Node.js    │      │   MongoDB    │  │
│  │   Client     │◄────►│   API        │◄────►│   Database   │  │
│  │  (Port 5173) │      │  (Port 5000) │      │              │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                                 │
│         │                      │                                 │
│         ▼                      ▼                                 │
│  ┌──────────────┐      ┌──────────────┐                        │
│  │   Google     │      │   Rate       │                        │
│  │   OAuth      │      │   Limiter    │                        │
│  │   Provider   │      │   (Memory)   │                        │
│  └──────────────┘      └──────────────┘                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 1️⃣ Google OAuth Login Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐                ┌─────────┐
│  User   │                │ Client  │                │   API   │                │ Google  │
└────┬────┘                └────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │                          │
     │ 1. Click "Sign in"       │                          │                          │
     ├─────────────────────────►│                          │                          │
     │                          │                          │                          │
     │                          │ 2. Open Google OAuth     │                          │
     │                          ├─────────────────────────────────────────────────────►│
     │                          │                          │                          │
     │                          │                          │    3. User authenticates │
     │                          │◄─────────────────────────────────────────────────────┤
     │                          │    (ID Token)            │                          │
     │                          │                          │                          │
     │                          │ 4. POST /auth/google     │                          │
     │                          │    { credential }        │                          │
     │                          ├─────────────────────────►│                          │
     │                          │                          │                          │
     │                          │                          │ 5. Verify ID Token       │
     │                          │                          ├─────────────────────────►│
     │                          │                          │                          │
     │                          │                          │ 6. Token Valid           │
     │                          │                          │◄─────────────────────────┤
     │                          │                          │                          │
     │                          │                          │ 7. Create/Update User    │
     │                          │                          │    Generate JWT Tokens   │
     │                          │                          │                          │
     │                          │ 8. Return Tokens         │                          │
     │                          │◄─────────────────────────┤                          │
     │                          │    { accessToken,        │                          │
     │                          │      refreshToken,       │                          │
     │                          │      user }              │                          │
     │                          │                          │                          │
     │                          │ 9. Store in localStorage │                          │
     │                          │    Redirect to Dashboard │                          │
     │                          │                          │                          │
     │ 10. Dashboard Loaded     │                          │                          │
     │◄─────────────────────────┤                          │                          │
     │                          │                          │                          │
```

## 2️⃣ Email Login Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│  User   │                │ Client  │                │   API   │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ 1. Enter Email           │                          │
     ├─────────────────────────►│                          │
     │                          │                          │
     │                          │ 2. POST /login           │
     │                          │    { email }             │
     │                          ├─────────────────────────►│
     │                          │                          │
     │                          │                          │ 3. Validate Email
     │                          │                          │    Check Rate Limit
     │                          │                          │    Check Account Lock
     │                          │                          │
     │                          │                          │ 4. Create/Find User
     │                          │                          │    Generate JWT Tokens
     │                          │                          │    Save Refresh Token
     │                          │                          │
     │                          │ 5. Return Tokens         │
     │                          │◄─────────────────────────┤
     │                          │    { accessToken,        │
     │                          │      refreshToken,       │
     │                          │      user }              │
     │                          │                          │
     │                          │ 6. Store in localStorage │
     │                          │    Redirect to Dashboard │
     │                          │                          │
     │ 7. Dashboard Loaded      │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
```

## 3️⃣ API Request with Token Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Client  │                │   API   │                │   DB    │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ 1. API Request           │                          │
     │    + Access Token        │                          │
     ├─────────────────────────►│                          │
     │                          │                          │
     │                          │ 2. Verify Access Token   │
     │                          │    (JWT Signature)       │
     │                          │                          │
     │                          │ 3. Check Expiration      │
     │                          │                          │
     │                          │ 4. Token Valid           │
     │                          │                          │
     │                          │ 5. Process Request       │
     │                          ├─────────────────────────►│
     │                          │                          │
     │                          │ 6. Return Data           │
     │                          │◄─────────────────────────┤
     │                          │                          │
     │ 7. Response              │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
```

## 4️⃣ Automatic Token Refresh Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Client  │                │   API   │                │   DB    │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ 1. API Request           │                          │
     │    + Expired Token       │                          │
     ├─────────────────────────►│                          │
     │                          │                          │
     │                          │ 2. Verify Token          │
     │                          │    Token Expired!        │
     │                          │                          │
     │ 3. 401 TOKEN_EXPIRED     │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │ 4. Interceptor Catches   │                          │
     │    Queue Original Request│                          │
     │                          │                          │
     │ 5. POST /auth/refresh    │                          │
     │    { refreshToken }      │                          │
     ├─────────────────────────►│                          │
     │                          │                          │
     │                          │ 6. Verify Refresh Token  │
     │                          │                          │
     │                          │ 7. Check DB Token        │
     │                          ├─────────────────────────►│
     │                          │                          │
     │                          │ 8. Token Valid           │
     │                          │◄─────────────────────────┤
     │                          │                          │
     │                          │ 9. Generate New Tokens   │
     │                          │    Save New Refresh Token│
     │                          ├─────────────────────────►│
     │                          │                          │
     │ 10. New Tokens           │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │ 11. Update localStorage  │                          │
     │     Retry Original Req   │                          │
     ├─────────────────────────►│                          │
     │                          │                          │
     │ 12. Success Response     │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
```

## 5️⃣ Logout Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Client  │                │   API   │                │   DB    │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ 1. Click Logout          │                          │
     │                          │                          │
     │ 2. POST /auth/logout     │                          │
     │    + Access Token        │                          │
     ├─────────────────────────►│                          │
     │                          │                          │
     │                          │ 3. Verify Access Token   │
     │                          │                          │
     │                          │ 4. Clear Refresh Token   │
     │                          ├─────────────────────────►│
     │                          │                          │
     │                          │ 5. Token Cleared         │
     │                          │◄─────────────────────────┤
     │                          │                          │
     │ 6. Success Response      │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │ 7. Clear localStorage    │                          │
     │    Redirect to Login     │                          │
     │                          │                          │
```

## 6️⃣ Rate Limiting Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Client  │                │   API   │                │ Limiter │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ 1. Login Request #1      │                          │
     ├─────────────────────────►│                          │
     │                          │ 2. Check Rate Limit      │
     │                          ├─────────────────────────►│
     │                          │ 3. OK (1/5)              │
     │                          │◄─────────────────────────┤
     │ 4. Success               │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │ ... (Requests 2-5) ...   │                          │
     │                          │                          │
     │ 5. Login Request #6      │                          │
     ├─────────────────────────►│                          │
     │                          │ 6. Check Rate Limit      │
     │                          ├─────────────────────────►│
     │                          │ 7. EXCEEDED (6/5)        │
     │                          │◄─────────────────────────┤
     │ 8. 429 Too Many Requests │                          │
     │◄─────────────────────────┤                          │
     │    { retryAfter: 900 }   │                          │
     │                          │                          │
```

## 7️⃣ Account Lockout Flow

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│ Client  │                │   API   │                │   DB    │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ 1. Failed Login #1-4     │                          │
     ├─────────────────────────►│                          │
     │                          │ 2. Increment Attempts    │
     │                          ├─────────────────────────►│
     │                          │    loginAttempts++       │
     │ 3. Error Response        │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │ 4. Failed Login #5       │                          │
     ├─────────────────────────►│                          │
     │                          │ 5. Increment & Lock      │
     │                          ├─────────────────────────►│
     │                          │    loginAttempts = 5     │
     │                          │    lockUntil = now+2hrs  │
     │ 6. Account Locked        │                          │
     │◄─────────────────────────┤                          │
     │    423 Locked            │                          │
     │                          │                          │
     │ 7. Login Attempt #6      │                          │
     ├─────────────────────────►│                          │
     │                          │ 8. Check Lock Status     │
     │                          ├─────────────────────────►│
     │                          │ 9. Still Locked          │
     │                          │◄─────────────────────────┤
     │ 10. 423 Account Locked   │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │ ... (2 hours later) ...  │                          │
     │                          │                          │
     │ 11. Successful Login     │                          │
     ├─────────────────────────►│                          │
     │                          │ 12. Reset Attempts       │
     │                          ├─────────────────────────►│
     │                          │    loginAttempts = 0     │
     │                          │    lockUntil = null      │
     │ 13. Success              │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
```

## 🔑 Token Structure

### Access Token (JWT)
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "user",
    "iat": 1234567890,
    "exp": 1234568790  // 15 minutes later
  },
  "signature": "..."
}
```

### Refresh Token (JWT)
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "id": "user_id",
    "email": "user@example.com",
    "iat": 1234567890,
    "exp": 1235172690  // 7 days later
  },
  "signature": "..."
}
```

## 📊 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Layer 1: Rate Limiting                                  │
│  ├─ 5 login attempts per 15 minutes                     │
│  └─ 10 OAuth attempts per 15 minutes                    │
│                                                           │
│  Layer 2: Account Lockout                               │
│  ├─ Lock after 5 failed attempts                        │
│  └─ 2-hour lockout duration                             │
│                                                           │
│  Layer 3: Token Validation                              │
│  ├─ JWT signature verification                          │
│  ├─ Token expiration check                              │
│  └─ Refresh token database validation                   │
│                                                           │
│  Layer 4: Google OAuth                                  │
│  ├─ ID token verification                               │
│  ├─ Email verification check                            │
│  └─ Audience validation                                 │
│                                                           │
│  Layer 5: CORS Protection                               │
│  ├─ Allowed origins whitelist                           │
│  └─ Credentials support                                 │
│                                                           │
│  Layer 6: Input Validation                              │
│  ├─ Email format validation                             │
│  ├─ Request body validation                             │
│  └─ SQL/NoSQL injection prevention                      │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Token Lifecycle

```
Access Token Lifecycle (15 minutes):
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Created │────►│  Valid  │────►│ Expired │────►│Refreshed│
└─────────┘     └─────────┘     └─────────┘     └─────────┘
   0 min          0-15 min         15 min          Auto

Refresh Token Lifecycle (7 days):
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│ Created │────►│  Valid  │────►│ Expired │────►│Re-login │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
   0 days         0-7 days         7 days        Required
```

---

**Visual Reference**: Use these diagrams to understand the complete OAuth flow in Career Twin AI.

For implementation details, see [OAUTH_SECURITY.md](OAUTH_SECURITY.md).
