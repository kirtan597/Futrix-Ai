import { useAuth } from '../store/useAuth';

// ── Base URL ──────────────────────────────────────────────────────────────────
// Dev  → empty string, Vite proxy forwards /api → localhost:5000
// Prod → VITE_API_URL must be set in Vercel dashboard
const API_BASE_URL = import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_URL || 'https://futrix-node-api.onrender.com').replace(/\/$/, '');

// ── JWT decode (local, no HTTP call) ─────────────────────────────────────────
function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000 - 30_000;
    } catch {
        return true;
    }
}

// ── Friendly error messages ───────────────────────────────────────────────────
function getErrorMessage(err: unknown): string {
    return err instanceof Error ? err.message : '';
}

function friendlyError(err: unknown, endpoint: string): string {
    const msg = getErrorMessage(err);
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')) {
        return 'Cannot reach the server. Please check your connection or try again.';
    }
    if (msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('temporarily unavailable')) {
        return 'Service is temporarily busy. Please try again in a moment.';
    }
    if (msg.includes('502') || msg.includes('504') || msg.includes('Gateway') || msg.includes('timeout')) {
        return 'Request took too long. Please try again.';
    }
    if (msg.includes('500')) {
        return 'Server error. Please try again.';
    }
    if (msg.includes('401') || msg.includes('Token') || msg.includes('Authentication')) {
        return 'Your session expired. Please log in again.';
    }
    if (msg.includes('429')) {
        return 'Too many requests. Please wait a moment and try again.';
    }
    if (msg.includes('405') || msg.includes('Method Not Allowed')) {
        return 'Invalid request. Please try again or contact support.';
    }
    return msg || 'Something went wrong. Please try again.';
}

class ApiService {
    private static instance: ApiService;
    private refreshPromise: Promise<string> | null = null;

    static getInstance(): ApiService {
        if (!ApiService.instance) ApiService.instance = new ApiService();
        return ApiService.instance;
    }

    private async refreshAccessToken(): Promise<string> {
        const { refreshToken, setAuth, clearAuth } = useAuth.getState();
        if (!refreshToken) {
            clearAuth();
            window.location.href = '/login';
            throw new Error('No refresh token available');
        }
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            if (!res.ok) throw new Error('Token refresh failed');
            const data = await res.json();
            const cur = useAuth.getState();
            setAuth(data.accessToken, data.refreshToken, {
                email: cur.email!,
                name: cur.name || undefined,
                avatar: cur.avatar || undefined,
            });
            return data.accessToken;
        } catch (err) {
            clearAuth();
            window.location.href = '/login';
            throw err;
        }
    }

    private async getValidAccessToken(): Promise<string> {
        const { accessToken } = useAuth.getState();
        if (!accessToken) {
            window.location.href = '/login';
            throw new Error('No access token');
        }
        if (!isTokenExpired(accessToken)) return accessToken;
        if (!this.refreshPromise) this.refreshPromise = this.refreshAccessToken();
        try {
            const token = await this.refreshPromise;
            this.refreshPromise = null;
            return token;
        } catch (err) {
            this.refreshPromise = null;
            throw err;
        }
    }

    async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        
        // For upload-resume, implement intelligent retry with exponential backoff
        const isUploadResume = endpoint.includes('upload-resume');
        const maxRetries = isUploadResume ? 5 : 1;
        const initialDelay = isUploadResume ? 3000 : 0; // 3 seconds initial delay for cold starts
        
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                let accessToken: string;
                try {
                    accessToken = await this.getValidAccessToken();
                } catch (tokenErr) {
                    // Token fetch failed — redirect to login
                    window.location.href = '/login';
                    throw new Error('Authentication failed. Please log in again.');
                }

                const res = await fetch(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                        ...options.headers,
                    },
                });

                // Handle specific error statuses
                if (res.status === 401) {
                    useAuth.getState().clearAuth();
                    window.location.href = '/login';
                    throw new Error('Your session expired. Please log in again.');
                }
                
                // For 503, retry silently on upload-resume
                if (res.status === 503) {
                    const body = await res.json().catch(() => ({}));
                    const error = new Error(body.message || 'Service temporarily unavailable');
                    
                    if (isUploadResume && attempt < maxRetries) {
                        console.log(`[API] Attempt ${attempt}/${maxRetries} failed with 503, retrying in ${initialDelay * attempt}ms...`);
                        lastError = error;
                        await new Promise(r => setTimeout(r, initialDelay * attempt));
                        continue; // Retry
                    }
                    throw error;
                }
                
                if (res.status === 500) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.message || 'Server error');
                }
                if (res.status === 429) {
                    throw new Error('429 - Rate limit exceeded');
                }
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.message || body.error || `HTTP ${res.status}`);
                }
                return await res.json();
            } catch (err: unknown) {
                lastError = err instanceof Error ? err : new Error(String(err));
                
                // Don't retry on client errors (4xx except 503) or auth errors
                const errMsg = lastError.message || '';
                if (errMsg.includes('401') || errMsg.includes('Authentication') || errMsg.includes('Session')) {
                    throw lastError;
                }
                
                // For other errors on non-upload-resume, throw immediately
                if (!isUploadResume || attempt === maxRetries) {
                    throw lastError;
                }
            }
        }
        
        // All retries exhausted
        throw lastError || new Error(friendlyError(lastError, endpoint));
    }

    async get<T = unknown>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    // No auth — login / google oauth
    async publicRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        try {
            const res = await fetch(url, {
                ...options,
                headers: { 'Content-Type': 'application/json', ...options.headers },
            });
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || body.error || String(res.status));
            }
            return await res.json();
        } catch (err: unknown) {
            throw new Error(friendlyError(err, endpoint));
        }
    }
}

export const apiService = ApiService.getInstance();
export default apiService;
