import { initializeApp, getApps, getApp } from 'firebase/app';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
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
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<UserCredential> {
    return signInWithPopup(auth, googleProvider);
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
