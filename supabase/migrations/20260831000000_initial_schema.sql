-- ============================================================================
-- Futrix AI — Initial Relational PostgreSQL Schema (Supabase)
-- Migration: 20260831000000_initial_schema.sql
-- Description: Normalized schema migrating from MongoDB Atlas to PostgreSQL
-- ============================================================================

-- Enable pgcrypto for UUID generation if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'email',
    google_id TEXT,
    firebase_uid TEXT,
    avatar TEXT,
    resume_text TEXT,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    readiness_score NUMERIC DEFAULT 0,
    last_login TIMESTAMPTZ,
    login_attempts INTEGER NOT NULL DEFAULT 0,
    lock_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mongo_id TEXT UNIQUE -- Migration idempotency reference
);

-- Comments on users table
COMMENT ON TABLE public.users IS 'Core user accounts and authentication metadata';
COMMENT ON COLUMN public.users.id IS 'Primary identifier (UUID)';
COMMENT ON COLUMN public.users.email IS 'User email address (unique, normalized to lowercase)';
COMMENT ON COLUMN public.users.firebase_uid IS 'Firebase Authentication UID for Google & Email sign-in';
COMMENT ON COLUMN public.users.mongo_id IS 'Original MongoDB _id for zero-loss idempotent migration';

-- ----------------------------------------------------------------------------
-- 2. REFRESH TOKENS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

-- Comments on refresh_tokens table
COMMENT ON TABLE public.refresh_tokens IS 'Long-lived JWT refresh tokens for session rotation';
COMMENT ON COLUMN public.refresh_tokens.user_id IS 'Foreign key linking token to owner user account';
COMMENT ON COLUMN public.refresh_tokens.token_hash IS 'Full JWT refresh token string or hash';
COMMENT ON COLUMN public.refresh_tokens.revoked_at IS 'Timestamp when token was rotated or invalidated';

-- ----------------------------------------------------------------------------
-- 3. ANALYSES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    resume_text TEXT,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    gap_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    readiness_score NUMERIC NOT NULL DEFAULT 0,
    roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
    score_breakdown JSONB,
    career_paths JSONB NOT NULL DEFAULT '[]'::jsonb,
    skill_weights JSONB NOT NULL DEFAULT '[]'::jsonb,
    category_distribution JSONB NOT NULL DEFAULT '[]'::jsonb,
    readiness_trajectory JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    mongo_id TEXT UNIQUE -- Migration idempotency reference
);

-- Comments on analyses table
COMMENT ON TABLE public.analyses IS 'Historical resume analyses, extracted skills, gaps, and roadmaps';
COMMENT ON COLUMN public.analyses.user_id IS 'Foreign key to users table with cascading delete';
COMMENT ON COLUMN public.analyses.readiness_score IS 'Readiness index score (0-100)';
COMMENT ON COLUMN public.analyses.score_breakdown IS 'Pillar scores (skill_match, stack_balance, cloud, devops, languages)';
COMMENT ON COLUMN public.analyses.mongo_id IS 'Original MongoDB _id for zero-loss idempotent migration';

-- ----------------------------------------------------------------------------
-- 4. INDEXES FOR PERFORMANCE & SORTING
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON public.users (firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_mongo_id ON public.users (mongo_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.refresh_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON public.refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON public.refresh_tokens (expires_at);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id_created ON public.analyses (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_email_created ON public.analyses (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_mongo_id ON public.analyses (mongo_id);

-- ----------------------------------------------------------------------------
-- 5. TRIGGER FOR UPDATED_AT TIMESTAMP
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_analyses_updated_at ON public.analyses;
CREATE TRIGGER set_analyses_updated_at
    BEFORE UPDATE ON public.analyses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
