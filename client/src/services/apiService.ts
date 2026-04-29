import { useAuth } from '../store/useAuth';

// Use Vite proxy in development, direct URL in production
const API_BASE_URL = import.meta.env.DEV 
    ? '' // Use Vite proxy in development
    : import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || errorData.error || 'Token refresh failed');
            }

            const data = await response.json();
            
            // Update tokens in store
            const currentUser = useAuth.getState();
            setAuth(data.accessToken, data.refreshToken, {
                email: currentUser.email!,
                name: currentUser.name || undefined,
                avatar: currentUser.avatar || undefined,
            });

            return data.accessToken;
        } catch (error) {
            // Clear auth on refresh failure
            clearAuth();
            throw error;
        }
    }

    private async getValidAccessToken(): Promise<string> {
        const { accessToken } = useAuth.getState();
        
        if (!accessToken) {
            throw new Error('No access token available');
        }

        // Try to use current token first
        try {
            // Test if token is valid by making a quick verification call
            const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                return accessToken;
            }
        } catch (error) {
            // Token might be expired, try to refresh
            console.log('Token verification failed, attempting refresh...');
        }

        // Token is invalid/expired, refresh it
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

    async request<T = any>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        
        try {
            // Get valid access token
            const accessToken = await this.getValidAccessToken();
            
            // Make the request with the token
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    ...options.headers,
                },
            });

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

    // Convenience methods
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

    // Public methods that don't require authentication
    async publicRequest<T = any>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
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