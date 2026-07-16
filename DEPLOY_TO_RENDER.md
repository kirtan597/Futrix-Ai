# Deploy Career Twin AI to Render

## Architecture

```
Netlify (React frontend)
    └── calls ──► Render (Node.js API)
                      └── calls ──► Render (Python AI)
                      └── reads ──► MongoDB Atlas
```

---

## Step 1 — MongoDB Atlas (Free)

1. Go to https://cloud.mongodb.com and create a free cluster
2. **Database Access** → Add user `futrix_admin` / choose a strong password
3. **Network Access** → Add `0.0.0.0/0` (allow all IPs — needed for Render)
4. **Connect** → "Connect your application" → copy the URI:
   ```
   mongodb+srv://futrix_admin:<password>@cluster0.xxx.mongodb.net/futrixai?retryWrites=true&w=majority
   ```
   Save this — you'll need it in Step 2.

---

## Step 2 — Deploy Python AI to Render

1. Go to https://render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Set:
   | Field | Value |
   |-------|-------|
   | Name | `futrix-python-ai` |
   | Root Directory | `python-ai` |
   | Runtime | **Python 3** |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
   | Instance Type | Free |

4. **No environment variables needed** for the Python service
5. Click **Create Web Service**
6. Wait for deploy — copy the URL, e.g. `https://futrix-python-ai.onrender.com`

---

## Step 3 — Deploy Node.js API to Render

1. Go to https://render.com → **New** → **Web Service**
2. Connect your GitHub repo
3. Set:
   | Field | Value |
   |-------|-------|
   | Name | `futrix-node-api` |
   | Root Directory | `node-api` |
   | Runtime | **Node** |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |
   | Instance Type | Free |

4. Add **Environment Variables** (click "Add Environment Variable" for each):

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Your Atlas URI from Step 1 |
   | `JWT_SECRET` | Generate: run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `JWT_REFRESH_SECRET` | Generate another random 64-char hex string |
   | `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
   | `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
   | `PYTHON_URL` | `https://futrix-python-ai.onrender.com` (URL from Step 2) |
   | `FRONTEND_URL` | `https://futrix-ai.netlify.app` (your Netlify URL) |

5. Click **Create Web Service**
6. Wait for deploy — copy the URL, e.g. `https://futrix-node-api.onrender.com`

---

## Step 4 — Update Frontend for Production

### 4a. Update Netlify Environment Variable

Go to https://app.netlify.com → Your site → **Site settings** → **Environment variables** → Add:

| Key | Value |
|-----|-------|
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `VITE_API_URL` | `https://futrix-node-api.onrender.com` |

### 4b. Update client/.env.example
```
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_API_URL=https://futrix-node-api.onrender.com
```

### 4c. Update Google Cloud Console

Add your production URLs to authorized origins and redirect URIs:

**Authorized JavaScript origins:**
```
http://localhost:5173
https://futrix-ai.netlify.app
```

**Authorized redirect URIs:**
```
http://localhost:5173
https://futrix-ai.netlify.app
```

---

## Step 5 — Deploy Frontend to Netlify

```bash
# Option A: Auto-deploy (Netlify connects to GitHub and deploys on every push)
git add .
git commit -m "chore: configure production deployment"
git push origin main
# Netlify picks it up automatically

# Option B: Manual CLI deploy
cd client
npm run build
npx netlify deploy --prod --dir dist
```

---

## Step 6 — Verify Everything Works

Test each service:

```bash
# Python AI
curl https://futrix-python-ai.onrender.com/health

# Node.js API
curl https://futrix-node-api.onrender.com/health

# Full auth flow — email login
curl -X POST https://futrix-node-api.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Then open your Netlify URL and test Google OAuth.

---

## Troubleshooting

### "Service unavailable" on Render free tier
Free services spin down after 15 min of inactivity. First request takes ~30s to wake up. This is normal.

### Google OAuth "origin not allowed" in production
Make sure `https://futrix-ai.netlify.app` (no trailing slash) is in Google Cloud Console authorized origins.

### CORS error
Make sure `FRONTEND_URL` env var on Render matches your exact Netlify URL.

### MongoDB connection fails
Make sure `0.0.0.0/0` is in Atlas Network Access. Render uses dynamic IPs so you can't whitelist a specific IP on the free tier.

---

## Final Directory Structure

```
career-twin-ai/
├── client/                    # React + Vite frontend (deploys to Netlify)
│   ├── src/
│   │   ├── pages/             # Login, Dashboard, Upload, etc.
│   │   ├── components/        # Charts, Sidebar, ScoreRing, etc.
│   │   ├── services/          # apiService.ts (HTTP client)
│   │   └── store/             # useAuth, useResume (Zustand)
│   ├── .env                   # Local only — not committed
│   └── .env.example           # Safe template — committed
│
├── node-api/                  # Express API (deploys to Render)
│   ├── routes/userRoutes.js   # Auth + resume + history endpoints
│   ├── models/                # User, Analysis (Mongoose)
│   ├── middleware/            # auth.js, rateLimiter.js
│   ├── utils/authUtils.js     # JWT helpers
│   ├── .env                   # Local only — not committed
│   └── .env.example           # Safe template — committed
│
├── python-ai/                 # FastAPI AI engine (deploys to Render)
│   ├── main.py                # FastAPI app + endpoints
│   ├── ai_engine.py           # NLP skill extraction + scoring
│   └── skills_db.json         # 160+ tech skills database
│
├── java-gateway/              # Java auth gateway (local/Docker only)
│   └── src/
│
├── render.yaml                # Render blueprint (optional auto-deploy)
├── docker-compose.yml         # Local Docker orchestration
├── run-dev.bat                # Windows dev launcher
└── README.md
```
