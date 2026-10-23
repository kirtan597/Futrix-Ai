/**
 * firebaseAdmin.js — STUB (Firebase removed)
 * Firebase Admin has been removed. Auth is now handled via Supabase.
 * This stub exists only to prevent import errors if any legacy code references it.
 */

async function verifyFirebaseToken(_idToken) {
    throw new Error('Firebase auth is not supported. Use POST /api/auth/supabase or POST /api/auth/google instead.');
}

module.exports = {
    firebaseApp: null,
    auth: null,
    verifyFirebaseToken,
};
