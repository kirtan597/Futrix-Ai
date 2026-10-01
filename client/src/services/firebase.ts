import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as fbSignOut,
    UserCredential,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBn-vXtr9NGlAWreLBXah6HT51IwgoiVwI',
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'futrix-ai.firebaseapp.com',
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || 'futrix-ai',
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'futrix-ai.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '816986372451',
    appId:             import.meta.env.VITE_FIREBASE_APP_ID || '1:816986372451:web:30da30e4924fd810147b56',
    measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-H4BTP1FM6Q',
};

// Initialize Firebase safely (prevent re-initialization in HMR)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: 'select_account',
});

/**
 * Sign in with Google.
 * Tries popup first (best UX). Falls back to redirect if the browser
 * blocks the popup (common in Safari, Firefox, and strict Chrome settings).
 *
 * IMPORTANT: signInWithPopup MUST be called as the very first async
 * operation in the click handler — before any state updates — so the
 * browser can verify it was triggered by a direct user gesture.
 */
export async function signInWithGoogle(): Promise<UserCredential | null> {
    try {
        return await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
        const code = (err as { code?: string }).code ?? '';
        // Fallback to redirect if popup was blocked or dismissed
        if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
            await signInWithRedirect(auth, googleProvider);
            return null; // null = redirect in progress, result handled on next load
        }
        throw err; // re-throw all other errors (cancelled, network, etc.)
    }
}

/**
 * Get the result of a signInWithRedirect call.
 * Call this once on mount in Login.tsx to handle the post-redirect return.
 * Returns null if no redirect was pending.
 */
export async function getGoogleRedirectResult(): Promise<UserCredential | null> {
    try {
        return await getRedirectResult(auth);
    } catch {
        return null;
    }
}

/**
 * Sign in with Email & Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, email, pass);
}

/**
 * Create new account with Email & Password
 */
export async function registerWithEmail(email: string, pass: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(auth, email, pass);
}

/**
 * Sign out of Firebase
 */
export async function logoutFirebase(): Promise<void> {
    return fbSignOut(auth);
}
