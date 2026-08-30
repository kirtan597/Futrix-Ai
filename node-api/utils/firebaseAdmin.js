const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const fs = require('fs');
const path = require('path');

/**
 * Initialize Firebase Admin SDK
 * Supports:
 * 1. Direct serviceAccountKey.json file (in node-api/ or path in env)
 * 2. Raw JSON string in process.env.FIREBASE_SERVICE_ACCOUNT
 * 3. Individual environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)
 * 4. Default Project ID fallback
 */
function initFirebaseAdmin() {
    if (getApps().length > 0) {
        return getApp();
    }

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
                console.log(`[Firebase Admin] ✅ Initialized using service account file: ${keyPath}`);
                return initializeApp({
                    credential: cert(serviceAccount),
                });
            } catch (err) {
                console.warn(`[Firebase Admin] ⚠️ Failed reading ${keyPath}: ${err.message}`);
            }
        }
    }

    // 2. Check for raw JSON string in env
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log('[Firebase Admin] ✅ Initialized using FIREBASE_SERVICE_ACCOUNT JSON env');
            return initializeApp({
                credential: cert(serviceAccount),
            });
        } catch (err) {
            console.warn(`[Firebase Admin] ⚠️ Failed parsing FIREBASE_SERVICE_ACCOUNT: ${err.message}`);
        }
    }

    // 3. Check for individual env vars
    const projectId = process.env.FIREBASE_PROJECT_ID || 'futrix-ai';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (privateKey) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    if (clientEmail && privateKey) {
        console.log('[Firebase Admin] ✅ Initialized using private key credentials from env');
        return initializeApp({
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });
    }

    // 4. Default Project ID initialization
    console.log(`[Firebase Admin] ℹ️ Initialized with Project ID: ${projectId}`);
    return initializeApp({
        projectId,
    });
}

const firebaseApp = initFirebaseAdmin();
const auth = getAuth(firebaseApp);

/**
 * Verify Firebase ID Token
 * @param {string} idToken
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>}
 */
async function verifyFirebaseToken(idToken) {
    return auth.verifyIdToken(idToken);
}

module.exports = {
    firebaseApp,
    auth,
    verifyFirebaseToken,
};
