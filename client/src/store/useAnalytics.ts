import { create } from 'zustand';

export interface HistoryEntry {
    _id: string;
    createdAt: string;
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap: string[];
}

interface AnalyticsState {
    history: HistoryEntry[];
    historyLoaded: boolean;
    setHistory: (h: HistoryEntry[]) => void;
    clearHistory: () => void;
}

export const useAnalytics = create<AnalyticsState>((set) => ({
    history: [],
    historyLoaded: false,

    setHistory: (history) => set({ history, historyLoaded: true }),

    clearHistory: () => set({ history: [], historyLoaded: false }),
}));
