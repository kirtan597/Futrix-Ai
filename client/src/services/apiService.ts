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
        return 'Cannot reach the server. Please check your connection or try again in a moment.';
    }
    if (msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('temporarily unavailable')) {
        if (endpoint.includes('upload-resume')) {
            return 'The AI engine is waking up (free tier cold start). Please wait 30-60 seconds and try again.';
        }
        return 'Service temporarily unavailable. Please try again in 30 seconds.';
    }
    if (msg.includes('502') || msg.includes('504') || msg.includes('Gateway') || msg.includes('timeout')) {
        if (endpoint.includes('upload-resume')) {
            return 'The request took too long to process. This is normal on the free tier when the AI is cold-starting. Please wait 60 seconds and try again.';
        }
        return 'Request timeout. Please try again in 30 seconds.';
    }
    if (msg.includes('500')) {
        if (endpoint.includes('upload-resume')) {
            return 'Analysis failed. The AI engine may be starting up — please wait 30 seconds and try again.';
        }
        return 'Server error. Please try again.';
    }
    if (msg.includes('401') || msg.includes('Token') || msg.includes('Authentication')) {
        return 'Your session expired. Please log in again.';
    }
    if (msg.includes('429')) {
        return 'Too many requests. Please wait a minute and try again.';
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
            if (res.status === 503) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || '503 - Service temporarily unavailable');
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
            throw new Error(friendlyError(err, endpoint));
        }
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
