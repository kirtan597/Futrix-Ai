# Futrix AI — Mandatory Project Rules

> **These rules are binding for every file, PR, and AI-generated change in this repository.**
> Violations block merges. No exceptions without an explicit override comment.

---

## 1. Architecture Overview

```
[Browser / React Client]
  ↕ HTTPS (JWT Bearer)
[Node.js API  — node-api/]          ← single public-facing backend
  ↕ HTTP (X-Internal-Secret header)
[Python AI Engine — python-ai/]     ← internal only, never called from browser
  ↕ Supabase PostgreSQL REST
[Database — Supabase]
```

- The **client MUST NEVER call Python AI directly**.  
- The **Python AI service MUST NEVER be exposed to the public internet without the internal-secret guard**.  
- The **Node API is the only origin** that talks to Python AI.

---

## 2. API Endpoint Contract (Source of Truth)

### 2.1 Node API (`node-api/`) — Base: `/api`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/login` | Public | Email magic login, returns JWT pair |
| POST | `/api/auth/firebase` | Public | Firebase ID token → JWT pair |
| POST | `/api/auth/refresh` | Public | Rotate refresh token |
| POST | `/api/auth/logout` | Public | Revoke refresh token server-side |
| GET | `/api/auth/verify` | Bearer | Validate current token, return user |
| GET | `/api/profile` | Bearer | Get authenticated user profile |
| PUT | `/api/profile` | Bearer | Update name/avatar |
| POST | `/api/upload-resume` | Bearer | Analyze resume text → save + return AI result |
| GET | `/api/history` | Bearer | Fetch analysis history by JWT user (no email query param) |
| GET | `/api/compare?id1=&id2=` | Bearer | Compare two analyses (IDOR-protected) |
| POST | `/api/jobs/match` | Bearer | Match skills to job DB |
| POST | `/api/ats-check` | Bearer | ATS heuristic check via Python AI |
| GET | `/health` | Public | Node API health status |
| GET | `/` | Public | API manifest |

### 2.2 Python AI Engine (`python-ai/`) — Internal Only

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/analyze` | X-Internal-Secret | Resume NLP analysis |
| POST | `/ats-check` | X-Internal-Secret | ATS heuristic analysis |
| POST | `/score-breakdown` | X-Internal-Secret | Score breakdown only |
| POST | `/career-path` | X-Internal-Secret | Career path from skills list |
| POST | `/compare` | X-Internal-Secret | Compare two resume texts |
| GET | `/health` | Public | Health ping |

**Rule:** Every Python endpoint except `/health` and `/` **must** use `Depends(verify_internal_secret)`.

---

## 3. Authentication Rules

### JWT Flow
- **Access token**: short-lived (15 min), stored in Zustand + `localStorage.accessToken`
- **Refresh token**: longer-lived, stored in `localStorage.refreshToken` + Supabase DB
- **Token rotation**: on every `/api/auth/refresh` call, old token is **revoked** and new pair issued
- **Logout**: MUST call `POST /api/auth/logout` with the refresh token to invalidate server-side

### Client Auth Rules
- Use **`apiService`** (from `services/apiService.ts`) for ALL authenticated requests.
  - `apiService` handles token expiry, refresh, and redirect-to-login automatically.
- Do **NOT** use `api.ts` (axios instance) for new features — it is legacy.
  - The existing usage in `ATSCheck.tsx` (`atsCheck` from `api.ts`) must be migrated to `apiService.post` on next touch.
- Public-only calls (login, firebase auth) use `apiService.publicRequest()`.
- **Never** pass email as a query param to `/api/history` — the backend ignores it and uses the JWT.

### Server Auth Rules
- Every protected route MUST use the `auth` middleware from `middleware/auth.js`.
- `req.user` is set by `auth` middleware from the verified JWT payload.
- **IDOR protection**: always compare `req.user.id` or `req.user.email` against DB record owner before returning data.

---

## 4. Client Integration Patterns

### 4.1 HTTP Client
```ts
// CORRECT — authenticated calls
import apiService from '../services/apiService';
const data = await apiService.get<MyType>('/api/endpoint');
const result = await apiService.post<MyType>('/api/endpoint', payload);

// CORRECT — unauthenticated/public calls
const auth = await apiService.publicRequest<AuthResponse>('/api/auth/firebase', {
  method: 'POST',
  body: JSON.stringify({ idToken }),
});

// WRONG — do not import from api.ts for new features
import { atsCheck } from '../services/api';
```

### 4.2 Resume Upload
```ts
// CORRECT payload
apiService.post('/api/upload-resume', { text: resumeText.trim() });
// WRONG — do not send email in body; server uses req.user.email
apiService.post('/api/upload-resume', { text, email });
```

### 4.3 History
```ts
// CORRECT — no query params needed
apiService.get('/api/history');
// WRONG — email param is ignored by server
api.get(`/api/history?email=${email}`);
```

### 4.4 ATS Check
```ts
// CORRECT payload
apiService.post('/api/ats-check', {
  resume: resumeText.trim(),
  target_role: jobDescription.trim() || undefined,
});
```

---

## 5. Node API → Python AI Integration

- ALWAYS pass `X-Internal-Secret` header when calling Python AI.
- ALWAYS ensure `INTERNAL_API_SECRET` is set in BOTH `node-api` and `python-ai` environments with the **same value**.
- ALWAYS strip trailing `/` from `PYTHON_URL` with `.replace(/\/$/, '')`.
- Use `callAIServiceWithRetry()` (3 retries, exponential backoff) for `/analyze`.
- Use direct axios call with 30s timeout for `/ats-check`.
- `PYTHON_URL` must be the **full URL including protocol**: `https://futrix-python-ai.onrender.com` (no trailing slash).

---

## 6. Environment Variables

### `node-api` (set in Render dashboard)
| Key | Required | Notes |
|-----|----------|-------|
| `NODE_ENV` | YES | `production` in prod |
| `SUPABASE_URL` | YES | Full project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | YES | Never expose to client |
| `JWT_SECRET` | YES | Min 32 chars |
| `JWT_REFRESH_SECRET` | YES | Min 32 chars |
| `INTERNAL_API_SECRET` | YES | Must match python-ai |
| `PYTHON_URL` | YES | Full HTTPS URL of python-ai service |
| `FRONTEND_URL` | YES | Frontend URL for CORS allowlist |

### `python-ai` (set in Render dashboard)
| Key | Required | Notes |
|-----|----------|-------|
| `INTERNAL_API_SECRET` | YES | Must match node-api value |
| `ALLOWED_ORIGINS` | YES | Comma-separated: node-api host + frontend |

### `client` (Netlify/Vercel environment)
| Key | Required | Notes |
|-----|----------|-------|
| `VITE_API_URL` | YES | Full HTTPS URL of node-api (no trailing slash) |
| `VITE_FIREBASE_*` | YES | All Firebase config keys |

---

## 7. Render Deployment Rules

- `PYTHON_URL` for `futrix-node-api` MUST be the full `https://` URL.
  - Use `property: hostport` or hardcode in dashboard — **not** bare `host` which omits protocol.
- `INTERNAL_API_SECRET` MUST be propagated to **both** services with the same value.
  - Use `generateValue: true` on node-api and reference the same secret on python-ai.
- Health check paths: Node API → `/health`, Python AI → `/health`.

---

## 8. Data Shapes

### Analysis Object
```ts
interface Analysis {
  id: string;          // UUID primary key
  _id: string;         // Alias (backward compat)
  user_id: string;
  email: string;
  skills: string[];
  gap_skills: string[];
  readiness_score: number;   // 0–100
  roadmap: string[];
  score_breakdown: object | null;
  career_paths: CareerPathItem[];
  skill_weights: object[];
  category_distribution: object[];
  readiness_trajectory: object | null;
  createdAt: Date | null;
  created_at: string;        // ISO string
}
```

### Auth Response
```ts
interface AuthResponse {
  status: 'logged_in';
  accessToken: string;
  refreshToken: string;
  user: { id: string; _id: string; email: string; name?: string; avatar?: string };
}
```

---

## 9. Error Handling

### Server
- 400: bad input, 401: no/expired token, 403: forbidden/IDOR, 404: not found, 429: rate limit, 500: server error, 503: dependency down
- In production: never expose raw error messages — return safe generic message, log internally.
- Python AI failures → return 503 with `retryAfter` field.

### Client
- All API errors → surface human-readable message via `Alert` component.
- 401 from protected route → clear auth + redirect `/login`.
- 503/timeout on resume upload → show Retry button.
- Never let uncaught promise rejections silently fail.

---

## 10. Rate Limits
- Login: 10 req / 15 min
- Firebase auth: 20 req / 15 min
- Upload resume: 100 req / 15 min

---

## 11. CORS
- Node API: `localhost:5173`, `*.netlify.app`, `*.vercel.app`, `FRONTEND_URL`
- Python AI: Node API host + frontend origins
- **Never wildcard `*` in production**

---

## 12. Code Standards
- TypeScript strict mode — no implicit `any`
- Functional components + hooks only (no class components except existing ErrorBoundary)
- Global state: Zustand only (`useAuth`, `useResume`)
- API calls: `apiService` singleton — no ad-hoc fetch/axios in components
- New routes in `userRoutes.js` must be added to the endpoint table in Section 2 and the root endpoint manifest in `server.js`

---

## 13. Security Checklist (every PR)
- [ ] No secrets in git
- [ ] All new protected endpoints use `auth` middleware
- [ ] IDOR check on all user-scoped data
- [ ] `INTERNAL_API_SECRET` sent on all Node→Python calls
- [ ] Input validation before passing to AI service
- [ ] Resume text: min 50, max 50,000 chars validated both client and server
