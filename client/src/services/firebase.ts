/**
 * firebase.ts — REMOVED
 * Firebase SDK has been removed. All auth is now handled via Supabase.
 * This stub re-exports Supabase equivalents so any legacy imports continue to work.
 */
export {
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logoutSupabase as logoutFirebase,
    getSupabaseRedirectResult as getGoogleRedirectResult,
} from './supabase';
