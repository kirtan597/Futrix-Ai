import { create } from 'zustand';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    email: string | null;
    name: string | null;
    avatar: string | null;
    setAuth: (accessToken: string, refreshToken: string, user: { email: string; name?: string; avatar?: string }) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
    updateAccessToken: (accessToken: string) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    email: localStorage.getItem('userEmail'),
    name: localStorage.getItem('userName'),
    avatar: localStorage.getItem('userAvatar'),

    setAuth: (accessToken, refreshToken, user) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userEmail', user.email);
        if (user.name) localStorage.setItem('userName', user.name);
        if (user.avatar) localStorage.setItem('userAvatar', user.avatar);
        
        set({ 
            accessToken, 
            refreshToken, 
            email: user.email,
            name: user.name || null,
            avatar: user.avatar || null
        });
    },

    updateAccessToken: (accessToken) => {
        localStorage.setItem('accessToken', accessToken);
        set({ accessToken });
    },

    clearAuth: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userAvatar');
        localStorage.removeItem('analysisResult');
        set({ 
            accessToken: null, 
            refreshToken: null, 
            email: null,
            name: null,
            avatar: null
        });
    },

    isAuthenticated: () => !!get().accessToken,
}));
