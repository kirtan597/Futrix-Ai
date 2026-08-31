const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

/**
 * Clean & normalize PEM private key string
 * Handles surrounding quotes, literal '\n', and carriage returns
 */
function cleanPrivateKey(rawKey) {
    if (!rawKey || typeof rawKey !== 'string') return null;
    let key = rawKey.trim();
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1);
    }
    key = key.replace(/\\n/g, '\n').replace(/\\r/g, '').trim();
    if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
        return null;
    }
    return key;
}

/**
 * Initialize Firebase Admin SDK safely
 * Supports:
 * 1. Direct serviceAccountKey.json file
 * 2. Raw JSON string in process.env.FIREBASE_SERVICE_ACCOUNT
 * 3. Individual environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 * 4. Safe Project ID fallback (never crashes on startup)
 */
function initFirebaseAdmin() {
    if (getApps().length > 0) {
        return getApp();
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || 'futrix-ai';

    // 1. Check for serviceAccountKey.json file
    const possiblePaths = [
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        path.join(__dirname, '..', 'serviceAccountKey.json'),
        path.join(__dirname, '..', 'config', 'serviceAccountKey.json'),
    ].filter(Boolean);

    for (const keyPath of possiblePaths) {
        if (fs.existsSync(keyPath)) {
            try {
                const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = cleanPrivateKey(serviceAccount.private_key) || serviceAccount.private_key;
                }
                console.log(`[Firebase Admin] ✅ Initialized using service account file: ${keyPath}`);
                return initializeApp({
                    credential: cert(serviceAccount),
                    projectId: serviceAccount.project_id || projectId,
                });
            } catch (err) {
                console.warn(`[Firebase Admin] ⚠️ Failed reading ${keyPath}: ${err.message}`);
            }
        }
    }

    // 2. Check for raw JSON string in env
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
            const serviceAccount = JSON.parse(rawJson);
            if (serviceAccount.private_key) {
                serviceAccount.private_key = cleanPrivateKey(serviceAccount.private_key) || serviceAccount.private_key;
            }
            console.log('[Firebase Admin] ✅ Initialized using FIREBASE_SERVICE_ACCOUNT JSON env');
            return initializeApp({
                credential: cert(serviceAccount),
                projectId: serviceAccount.project_id || projectId,
            });
        } catch (err) {
            console.warn(`[Firebase Admin] ⚠️ Failed parsing FIREBASE_SERVICE_ACCOUNT: ${err.message}`);
        }
    }

    // 3. Check for individual env vars
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = cleanPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (clientEmail && privateKey) {
        try {
            console.log('[Firebase Admin] ✅ Initializing using private key credentials from env');
            return initializeApp({
                credential: cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                projectId,
            });
        } catch (err) {
            console.warn(`[Firebase Admin] ⚠️ Could not initialize with private key: ${err.message}. Falling back to project ID.`);
        }
    }

    // 4. Default Project ID fallback
    try {
        console.log(`[Firebase Admin] ℹ️ Initializing with Project ID fallback: ${projectId}`);
        return initializeApp({
            projectId,
        });
    } catch (err) {
        console.warn(`[Firebase Admin] ⚠️ Default initialization warning: ${err.message}`);
        return getApps()[0] || null;
    }
}

let firebaseApp = null;
let auth = null;

try {
    firebaseApp = initFirebaseAdmin();
    if (firebaseApp) {
        auth = getAuth(firebaseApp);
    }
} catch (err) {
    console.error(`[Firebase Admin] ❌ Initialization error: ${err.message}`);
}

/**
 * Verify Firebase ID Token
 * @param {string} idToken
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>}
 */
async function verifyFirebaseToken(idToken) {
    if (!auth) {
        throw new Error('Firebase Admin auth is not initialized');
    }
    return auth.verifyIdToken(idToken);
}

module.exports = {
    firebaseApp,
    auth,
    verifyFirebaseToken,
};
