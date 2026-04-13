import axios from 'axios';

// ─── Axios instance ───────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: '/api',
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor: inject JWT ─────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 globally ───────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser = (email: string) =>
    api.post<{ status: string; token: string }>('/login', { email });

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
