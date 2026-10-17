/**
 * Supabase Auth Service
 * Provides the same API shape as the old firebase.ts so that Login.tsx
 * and any other callers need minimal changes.
 *
 * Supported methods:
 *   - signInWithGoogle()        → OAuth popup (falls back to redirect)
 *   - getSupabaseRedirectResult() → read redirect result on page load
 *   - loginWithEmail(email, pass)
 *   - registerWithEmail(email, pass)
 *   - logoutSupabase()
 *   - getSupabaseAccessToken()  → get current session JWT for backend exchange
 */
import { supabase } from '../utils/supabase/client';
import type { AuthError, User } from '@supabase/supabase-js';

export interface SupabaseUserCredential {
    user: User;
    accessToken: string; // Supabase JWT for backend exchange
}

function mapAuthError(err: AuthError | null): Error {
    if (!err) return new Error('Unknown auth error');
    const msg = err.message || '';

    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
        return new Error('auth/invalid-credential: Invalid email or password.');
    }
    if (msg.includes('Email not confirmed')) {
        return new Error('Please verify your email address before signing in.');
    }
    if (msg.includes('User already registered') || msg.includes('already been registered')) {
        return new Error('auth/email-already-in-use: An account already exists with this email.');
    }
    if (msg.includes('Password should be')) {
        return new Error('auth/weak-password: ' + msg);
    }
    if (msg.includes('popup_closed') || msg.includes('popup-closed')) {
        return new Error('auth/popup-closed-by-user: Sign-in popup was closed.');
    }
    if (msg.includes('Unsupported provider') || msg.includes('provider is not enabled')) {
        return new Error('auth/unsupported-provider: Google provider is not enabled in your Supabase project. Enable it under Authentication > Providers in your Supabase Dashboard.');
    }
    return new Error(msg);
}

/**
 * Sign in with Google via OAuth popup.
 * Falls back to redirect when popups are blocked.
 * Returns SupabaseUserCredential on success, null if redirect was triggered.
 */
export async function signInWithGoogle(): Promise<SupabaseUserCredential | null> {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Use popup flow — Supabase handles this via redirect internally.
                // Setting queryParams to force account picker each time.
                queryParams: { prompt: 'select_account' },
                // Return to current page after OAuth redirect.
                redirectTo: window.location.origin + window.location.pathname,
                skipBrowserRedirect: false,
            },
        });

        if (error) throw mapAuthError(error);

        // Supabase OAuth always does a redirect flow. The page will reload.
        // Return null to signal redirect is in progress.
        console.log('[Supabase Auth] Google OAuth redirect initiated', data);
        return null;
    } catch (err) {
        if (err instanceof Error) throw err;
        throw new Error(String(err));
    }
}

/**
 * After OAuth redirect returns to the app, Supabase SDK auto-parses the URL
 * and restores the session. Call this once on mount to get the active session.
 * Returns SupabaseUserCredential if a session is found, null otherwise.
 */
export async function getSupabaseRedirectResult(): Promise<SupabaseUserCredential | null> {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) return null;

        return {
            user: data.session.user,
            accessToken: data.session.access_token,
        };
    } catch {
        return null;
    }
}

/**
 * Get the current Supabase session access token for backend exchange.
 */
export async function getSupabaseAccessToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
}

/**
 * Sign in with Email & Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<SupabaseUserCredential> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

    if (error || !data.user || !data.session) {
        throw mapAuthError(error);
    }

    return { user: data.user, accessToken: data.session.access_token };
}

/**
 * Create a new account with Email & Password
 */
export async function registerWithEmail(email: string, pass: string): Promise<SupabaseUserCredential> {
    const { data, error } = await supabase.auth.signUp({ email, password: pass });

    if (error || !data.user) {
        throw mapAuthError(error);
    }

    // signUp may return a user without a session if email confirmation is required.
    if (!data.session) {
        throw new Error('Please check your email to confirm your account before signing in.');
    }

    return { user: data.user, accessToken: data.session.access_token };
}

/**
 * Sign out of Supabase
 */
export async function logoutSupabase(): Promise<void> {
    await supabase.auth.signOut();
}

/**
 * Listen to auth state changes (e.g. for token refresh handling).
 */
export function onSupabaseAuthStateChange(
    callback: (event: string, session: { access_token: string; user: User } | null) => void
) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session ? { access_token: session.access_token, user: session.user } : null);
    });
}
