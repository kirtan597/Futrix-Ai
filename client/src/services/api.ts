import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: '/api',
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// ─── Request interceptor: inject JWT ─────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor: handle token refresh ──────────────────────────────
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            const errorData = error.response.data as { code?: string };
            
            // Check if it's a token expiration error
            if (errorData?.code === 'TOKEN_EXPIRED') {
                if (isRefreshing) {
                    // If already refreshing, queue this request
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return api(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                const refreshToken = localStorage.getItem('refreshToken');
                
                if (!refreshToken) {
                    // No refresh token, redirect to login
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                try {
                    // Attempt to refresh the token
                    const response = await axios.post('/api/auth/refresh', {
                        refreshToken
                    });

                    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
                    
                    // Update tokens in localStorage
                    localStorage.setItem('accessToken', newAccessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    // Update the authorization header
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }

                    processQueue(null, newAccessToken);
                    
                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError as Error, null);
                    
                    // Refresh failed, clear auth and redirect to login
                    localStorage.clear();
                    window.location.href = '/login';
                    
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            } else {
                // Other 401 errors, clear and redirect
                localStorage.clear();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser = (email: string) =>
    api.post<{ status: string; accessToken: string; refreshToken: string; user: any }>('/login', { email });

export const googleLogin = (credential: string) =>
    api.post<{ status: string; accessToken: string; refreshToken: string; user: any }>('/auth/google', { credential });

export const refreshAccessToken = (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken });

export const logoutUser = () =>
    api.post('/auth/logout');

export const verifyToken = () =>
    api.get<{ valid: boolean; user: any }>('/auth/verify');

// ─── Resume ──────────────────────────────────────────────────────────────────
export interface AnalyzePayload { text: string; email: string }
export const analyzeResume = (payload: AnalyzePayload) =>
    api.post('/upload-resume', payload);

// ─── History ─────────────────────────────────────────────────────────────────
export const fetchHistory = (email: string) =>
    api.get(`/history?email=${encodeURIComponent(email)}`);

// ─── Compare two analyses ─────────────────────────────────────────────────────
export const compareAnalyses = (id1: string, id2: string) =>
    api.get(`/compare?id1=${id1}&id2=${id2}`);

// ─── Job matches ──────────────────────────────────────────────────────────────
export const fetchJobMatches = (skills: string[]) =>
    api.post('/jobs/match', { skills });

export default api;
