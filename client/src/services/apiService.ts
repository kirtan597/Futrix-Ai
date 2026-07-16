import { useAuth } from '../store/useAuth';

// Use Vite proxy in development, deployed API URL in production
const API_BASE_URL = import.meta.env.DEV
    ? ''  // Vite proxy handles /api → localhost:5000
    : import.meta.env.VITE_API_URL || '';

if (!import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
    console.error('[Futrix AI] VITE_API_URL is not set. API calls will fail in production.');
}

// ─── Local JWT expiry check — no extra HTTP call needed ──────────────────────
function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000 - 30_000; // 30s buffer
    } catch {
        return true;
    }
}

class ApiService {
    private static instance: ApiService;
    private refreshPromise: Promise<string> | null = null;

    static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
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
            const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || 'Token refresh failed');
            }

            const data = await response.json();
            const currentUser = useAuth.getState();
            setAuth(data.accessToken, data.refreshToken, {
                email: currentUser.email!,
                name: currentUser.name || undefined,
                avatar: currentUser.avatar || undefined,
            });

            return data.accessToken;
        } catch (error) {
            clearAuth();
            window.location.href = '/login';
            throw error;
        }
    }

    private async getValidAccessToken(): Promise<string> {
        const { accessToken } = useAuth.getState();
        
        if (!accessToken) {
            window.location.href = '/login';
            throw new Error('No access token available');
        }

        // ✅ Decode JWT locally — no extra HTTP call
        if (!isTokenExpired(accessToken)) {
            return accessToken;
        }

        // Token is expired — refresh it (deduplicate concurrent refresh attempts)
        if (!this.refreshPromise) {
            this.refreshPromise = this.refreshAccessToken();
        }

        try {
            const newToken = await this.refreshPromise;
            this.refreshPromise = null;
            return newToken;
        } catch (error) {
            this.refreshPromise = null;
            throw error;
        }
    }

    async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        
        try {
            const accessToken = await this.getValidAccessToken();
            
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    ...options.headers,
                },
            });

            if (response.status === 401) {
                // Force refresh on unexpected 401
                useAuth.getState().clearAuth();
                window.location.href = '/login';
                throw new Error('Session expired. Please login again.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    async get<T = any>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T = any>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T = any>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T = any>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }

    // Public requests that don't require authentication (login, OAuth)
    async publicRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`);
        }

        return await response.json();
    }
}

export const apiService = ApiService.getInstance();
export default apiService;