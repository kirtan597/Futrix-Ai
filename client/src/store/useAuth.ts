import { create } from 'zustand';

interface AuthState {
    token: string | null;
    email: string | null;
    setAuth: (token: string, email: string) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
}

export const useAuth = create<AuthState>((set, get) => ({
    token: localStorage.getItem('token'),
    email: localStorage.getItem('userEmail'),

    setAuth: (token, email) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userEmail', email);
        set({ token, email });
    },

    clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('analysisResult');
        set({ token: null, email: null });
    },

    isAuthenticated: () => !!get().token,
}));
