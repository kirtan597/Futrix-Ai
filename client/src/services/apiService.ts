import { useAuth } from '../store/useAuth';

// ── Base URL ──────────────────────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_URL || 'https://futrix-node-api.onrender.com').replace(/\/$/, '');

console.log('[API] Environment:', import.meta.env.MODE);
console.log('[API] Base URL:', API_BASE_URL || 'localhost:5000');

// ── JWT decode (local, no HTTP call) ─────────────────────────────────────────
function isTokenExpired(token: string): boolean {
    try {
        if (!token) return true;
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        const payload = JSON.parse(atob(parts[1]));
        return Date.now() >= payload.exp * 1000 - 30_000; // 30s buffer
    } catch (err) {
        console.warn('[API] Token decode error:', err);
        return true;
    }
}

// ── Friendly error messages ───────────────────────────────────────────────────
function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    return JSON.stringify(err);
}

function friendlyError(err: unknown): string {
    const msg = getErrorMessage(err);
    
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')) {
        return 'Cannot reach server. Check connection.';
    }
    if (msg.includes('503') || msg.includes('Unavailable') || msg.includes('unavailable')) {
        return 'Service busy. Try again in a moment.';
    }
    if (msg.includes('502') || msg.includes('504') || msg.includes('Gateway') || msg.includes('timeout')) {
        return 'Request timeout. Please try again.';
    }
    if (msg.includes('500')) {
        return 'Server error. Try again.';
    }
    if (msg.includes('401') || msg.includes('Token') || msg.includes('Auth')) {
        return 'Session expired. Please log in.';
    }
    if (msg.includes('403')) {
        return 'Access denied.';
    }
    if (msg.includes('429')) {
        return 'Too many requests. Wait a moment.';
    }
    if (msg.includes('400')) {
        return 'Invalid request.';
    }
    
    return msg || 'Something went wrong.';
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
            throw new Error('No refresh token');
        }
        
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });
            
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || `Refresh failed: ${res.status}`);
            }
            
            const data = await res.json();
            const currentState = useAuth.getState();
            
            setAuth(data.accessToken, data.refreshToken, {
                email: currentState.email!,
                name: currentState.name || undefined,
                avatar: currentState.avatar || undefined,
            });
            
            console.log('[API] Access token refreshed');
            return data.accessToken;
        } catch (err) {
            console.error('[API] Token refresh error:', err);
            clearAuth();
            throw err;
        }
    }

    private async getValidAccessToken(): Promise<string> {
        const { accessToken, refreshToken } = useAuth.getState();
        
        // No token at all
        if (!accessToken) {
            console.warn('[API] No access token found');
            window.location.href = '/login';
            throw new Error('No access token available');
        }
        
        // Token still valid
        if (!isTokenExpired(accessToken)) {
            return accessToken;
        }
        
        // Token expired, try to refresh
        console.log('[API] Access token expired, refreshing...');
        
        if (!refreshToken) {
            console.warn('[API] No refresh token found');
            window.location.href = '/login';
            throw new Error('No refresh token available');
        }
        
        // Prevent concurrent refresh attempts
        if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken();
        }
        
        try {
            const newAccessToken = await this.refreshPromise;
            this.refreshPromise = null;
            console.log('[API] Token refreshed successfully');
            return newAccessToken;
        } catch (err) {
            this.refreshPromise = null;
            console.error('[API] Token refresh failed:', err);
            window.location.href = '/login';
            throw err;
        }
    }

    async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const isUploadResume = endpoint.includes('upload-resume');
        const maxRetries = isUploadResume ? 5 : 1;
        const initialDelay = isUploadResume ? 500 : 0;
        
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Get valid token
                let accessToken: string;
                try {
                    accessToken = await this.getValidAccessToken();
                } catch (tokenErr) {
                    console.error('[API] Token error:', tokenErr);
                    useAuth.getState().clearAuth();
                    window.location.href = '/login';
                    throw new Error('Auth failed. Redirecting to login.');
                }

                // Make request
                const res = await fetch(url, {
                    ...options,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                        ...options.headers,
                    },
                });

                // Handle 401 immediately
                if (res.status === 401) {
                    useAuth.getState().clearAuth();
                    window.location.href = '/login';
                    throw new Error('Unauthorized. Redirecting to login.');
                }
                
                // Handle 503 with retry
                if (res.status === 503) {
                    const body = await res.json().catch(() => ({}));
                    const error = new Error(body.message || 'Service unavailable');
                    
                    if (isUploadResume && attempt < maxRetries) {
                        const delayMs = initialDelay * Math.pow(2, attempt - 1);
                        console.log(`[API] Retry ${attempt}/${maxRetries} in ${delayMs}ms`);
                        lastError = error;
                        await new Promise(r => setTimeout(r, delayMs));
                        continue;
                    }
                    throw error;
                }
                
                // Handle other errors
                if (res.status === 500) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.message || 'Server error');
                }
                if (res.status === 429) {
                    throw new Error('Rate limit exceeded');
                }
                if (!res.ok) {
                    const body = await res.json().catch(() => ({}));
                    throw new Error(body.message || body.error || `HTTP ${res.status}`);
                }
                
                return await res.json();
            } catch (err) {
                lastError = err instanceof Error ? err : new Error(String(err));
                
                // Don't retry auth/rate limit errors
                if (lastError.message.includes('Auth') || lastError.message.includes('Redirecting') || lastError.message.includes('Rate')) {
                    throw lastError;
                }
                
                // Don't retry on non-upload-resume or last attempt
                if (!isUploadResume || attempt === maxRetries) {
                    throw lastError;
                }
            }
        }
        
        throw lastError || new Error(friendlyError(lastError));
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
            throw new Error(friendlyError(err));
        }
    }
}

export const apiService = ApiService.getInstance();
export default apiService;
