import { create } from 'zustand';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AppError {
    message: string;
    code?: string;
    severity: ErrorSeverity;
    timestamp?: Date;
    errorId?: string;
    context?: Record<string, any>;
    retryable?: boolean;
    action?: {
        label: string;
        handler: () => void | Promise<void>;
    };
}

export interface ErrorState {
    error: AppError | null;
    errors: AppError[];
    setError: (error: AppError | null) => void;
    addError: (error: AppError) => void;
    clearError: () => void;
    clearAllErrors: () => void;
    dismissError: (index: number) => void;
    hasErrors: () => boolean;
    getLatestError: () => AppError | null;
    isNetworkError: () => boolean;
    isServiceUnavailable: () => boolean;
    isRateLimited: () => boolean;
}

export const useErrorStore = create<ErrorState>((set, get) => ({
    error: null,
    errors: [],

    setError: (error: AppError | null) => {
        if (error) {
            set({
                error: {
                    ...error,
                    timestamp: error.timestamp || new Date(),
                    errorId: error.errorId || `ERR_${Date.now()}`,
                },
            });
        } else {
            set({ error: null });
        }
    },

    addError: (error: AppError) => {
        const newError = {
            ...error,
            timestamp: error.timestamp || new Date(),
            errorId: error.errorId || `ERR_${Date.now()}`,
        };

        set((state) => ({
            error: newError,
            errors: [newError, ...state.errors].slice(0, 10),
        }));
    },

    clearError: () => {
        set({ error: null });
    },

    clearAllErrors: () => {
        set({ error: null, errors: [] });
    },

    dismissError: (index: number) => {
        set((state) => ({
            errors: state.errors.filter((_, i) => i !== index),
        }));
    },

    hasErrors: () => {
        const { errors } = get();
        return errors.length > 0;
    },

    getLatestError: () => {
        const { errors } = get();
        return errors[0] || null;
    },

    isNetworkError: () => {
        const { error } = get();
        return error?.code === 'NETWORK_ERROR' || error?.code === 'ECONNREFUSED';
    },

    isServiceUnavailable: () => {
        const { error } = get();
        return (
            error?.code === 'SERVICE_UNAVAILABLE' ||
            error?.code === 'CIRCUIT_OPEN' ||
            (error?.message ? error.message.includes('503') : false)
        );
    },

    isRateLimited: () => {
        const { error } = get();
        return error?.code === 'RATE_LIMITED' || (error?.message ? error.message.includes('429') : false);
    },
}));

export default useErrorStore;