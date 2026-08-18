import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import './index.css'
import './mobile.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Validation checks for Google OAuth configuration
if (!GOOGLE_CLIENT_ID) {
  console.error('[Futrix AI] ❌ VITE_GOOGLE_CLIENT_ID is not set. Google OAuth will not work.');
  console.warn('[Futrix AI] Please add VITE_GOOGLE_CLIENT_ID to client/.env');
} else {
  console.log('[Futrix AI] ✅ Google OAuth Client ID loaded');
  console.log('[Futrix AI] Client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');
}

// Log current environment
console.log('[Futrix AI] Environment:', import.meta.env.MODE);
console.log('[Futrix AI] Frontend URL:', window.location.origin);

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID ?? ''}>
    <App />
  </GoogleOAuthProvider>,
)
