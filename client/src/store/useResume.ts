import { create } from 'zustand';

export interface AnalysisResult {
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap: string[];
    score_breakdown?: ScoreBreakdown;
    career_paths?: CareerPathSuggestion[];
}

export interface ScoreBreakdown {
    skill_match:    number;
    stack_balance:  number;
    cloud_presence: number;
    devops_score:   number;
    language_div:   number;
}

export interface CareerPathSuggestion {
    role:          string;
    match_percent: number;
    salary_range:  string;
    skills_needed: string[];
}

interface ResumeState {
    result: AnalysisResult | null;
    resumeText: string;
    isAnalyzing: boolean;
    setResult: (r: AnalysisResult) => void;
    setResumeText: (t: string) => void;
    setAnalyzing: (v: boolean) => void;
    clearResult: () => void;
    loadFromStorage: () => void;
}

export const useResume = create<ResumeState>((set) => ({
    result: null,
    resumeText: '',
    isAnalyzing: false,

    setResult: (result) => {
        localStorage.setItem('analysisResult', JSON.stringify(result));
        set({ result });
    },

    setResumeText: (resumeText) => set({ resumeText }),

    setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),

    clearResult: () => {
        localStorage.removeItem('analysisResult');
        set({ result: null, resumeText: '' });
    },

    loadFromStorage: () => {
        const stored = localStorage.getItem('analysisResult');
        if (stored) {
            try {
                const result = JSON.parse(stored) as AnalysisResult;
                set({ result });
            } catch { /* ignore */ }
        }
    },
}));
