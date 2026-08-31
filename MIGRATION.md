# 📦 Futrix AI — MongoDB to PostgreSQL (Supabase) Database Migration Guide

This document details the complete, verified procedure for transitioning Futrix AI from **MongoDB Atlas (Mongoose)** to **PostgreSQL on Supabase**.

---

## 🏛️ 1. Architecture & Schema Mapping

The database layer has been restructured from document-based collections to a normalized relational PostgreSQL schema:

### `users` Table
| PostgreSQL Column | Type | Constraints | Source (MongoDB) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | `_id` | Primary user identifier |
| `email` | `TEXT` | `NOT NULL UNIQUE` | `email` | Normalized lowercase email |
| `name` | `TEXT` | | `name` | User display name |
| `auth_provider` | `TEXT` | `NOT NULL DEFAULT 'email'` | Provider inferred | `firebase`, `google`, or `email` |
| `google_id` | `TEXT` | | `googleId` | Google OAuth ID |
| `firebase_uid` | `TEXT` | | `firebaseUid` | Firebase Auth UID |
| `avatar` | `TEXT` | | `avatar` | User avatar URL |
| `resume_text` | `TEXT` | | `resumeText` | Last parsed resume text |
| `skills` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | `skills` | Array of detected skill names |
| `readiness_score`| `NUMERIC` | `DEFAULT 0` | `readinessScore` | Aggregate score |
| `last_login` | `TIMESTAMPTZ` | | `lastLogin` | Timestamp of last authentication |
| `login_attempts`| `INTEGER` | `NOT NULL DEFAULT 0` | `loginAttempts` | Counter for rate/brute-force defense |
| `lock_until` | `TIMESTAMPTZ` | | `lockUntil` | Account lockout expiration |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | `createdAt` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | `updatedAt` | Auto-updated via trigger |
| `mongo_id` | `TEXT` | `UNIQUE` | `_id` | Idempotency migration reference |

### `refresh_tokens` Table
| PostgreSQL Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique token record ID |
| `user_id` | `UUID` | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` | Owner user ID with cascade deletion |
| `token_hash` | `TEXT` | `NOT NULL` | JWT refresh token string |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | Token expiration timestamp (7 days) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Issuance timestamp |
| `revoked_at` | `TIMESTAMPTZ` | | Timestamp when revoked on rotation/logout |

### `analyses` Table
| PostgreSQL Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique analysis report ID |
| `user_id` | `UUID` | `REFERENCES users(id) ON DELETE CASCADE` | Foreign key to `users.id` |
| `email` | `TEXT` | `NOT NULL` | Indexed user email |
| `resume_text` | `TEXT` | | Raw uploaded resume text |
| `skills` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Extracted skill tokens array |
| `gap_skills` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Identified gaps array |
| `readiness_score`| `NUMERIC` | `NOT NULL DEFAULT 0` | 0–100 Readiness index score |
| `roadmap` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Sequential milestone steps |
| `score_breakdown`| `JSONB` | | 5-pillar competency scores |
| `career_paths` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Role match trajectories & salaries |
| `skill_weights` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Domain proficiencies & benchmarks |
| `category_distribution` | `JSONB` | `NOT NULL DEFAULT '[]'::jsonb` | Category benchmark coverage breakdown |
| `readiness_trajectory` | `JSONB` | | Milestone score projection progression |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Chronological sort timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT NOW()` | Update timestamp |
| `mongo_id` | `TEXT` | `UNIQUE` | Original MongoDB `_id` |

---

## 🛠️ 2. Supabase Initial Setup

1. Create a new project on [Supabase](https://supabase.com/).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/migrations/20260831000000_initial_schema.sql`](file:///d:/Projects/Futrix-Ai/Futrix-Ai/supabase/migrations/20260831000000_initial_schema.sql).
4. Navigate to **Project Settings** ➔ **API**:
   - Copy **Project URL** (`SUPABASE_URL`)
   - Copy **service_role secret** (`SUPABASE_SERVICE_ROLE_KEY`) *(Keep secret!)*
   - Copy **anon public** (`SUPABASE_ANON_KEY`)

---

## 🚀 3. Running the Data Migration Script

The standalone migration script safely reads all documents from your existing MongoDB Atlas database and performs an idempotent upsert into Supabase.

### A. Dry-Run Mode (Validation without writing)
```bash
node node-api/scripts/migrate-to-supabase.js --dry-run
```
*Expected Output:*
- Connects to MongoDB Atlas
- Reports total user and analysis counts
- Displays sample transformed JSON payloads
- Validates field mappings with 0 modifications

### B. Live Migration
Set your live Supabase credentials in `node-api/.env` or pass as environment variables:
```bash
SUPABASE_URL="https://your-project.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
MONGO_URI="mongodb+srv://..." \
node node-api/scripts/migrate-to-supabase.js
```
*Features:*
- Preserves all original timestamps (`createdAt`/`updatedAt`).
- Links `analyses.user_id` foreign keys to corresponding `users.id`.
- Performs post-migration count verification comparing MongoDB vs. PostgreSQL.
- Idempotent: can be safely re-run without creating duplicates.

---

## 🧪 4. Testing & Verification

Run the automated integration test suite:
```bash
node node-api/tests/test-db-integration.js
```

### Verified Scenarios (31 / 31 Passing):
1. ✅ Database connectivity probe (`checkDbConnection`)
2. ✅ User creation, lookup by email, lookup by ID
3. ✅ Account lockout (5 failed attempts ➔ 2-hour lock) & reset on success
4. ✅ JWT Refresh token persistence, rotation, and revocation on logout
5. ✅ Resume analysis creation with JSONB arrays and dual `_id`/`id` compatibility
6. ✅ User-scoped history retrieval with chronological ordering (`created_at DESC`)
7. ✅ IDOR Cross-User Isolation: User A cannot query or compare User B's analyses
8. ✅ Comparative analysis delta computation

---

## 🔒 5. Production Environment Variables (Render)

Update the environment variables on Render for `futrix-node-api`:

| Key | Example Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `SUPABASE_URL` | `https://xyzcompany.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `JWT_SECRET` | `your_secure_jwt_secret_min_32_chars` |
| `JWT_REFRESH_SECRET` | `your_secure_refresh_secret_min_32_chars` |
| `PYTHON_URL` | `https://futrix-python-ai.onrender.com` |
| `INTERNAL_API_SECRET` | `your_shared_internal_secret` |
| `CLIENT_URL` | `https://futrixai.netlify.app` |
| `FIREBASE_PROJECT_ID` | `futrix-ai` |
| `FIREBASE_SERVICE_ACCOUNT` | `{"type":"service_account",...}` |
