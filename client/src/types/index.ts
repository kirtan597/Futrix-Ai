/**
 * types/index.ts — Futrix AI
 * Shared TypeScript types and interfaces across the application.
 * Import from here: import type { User, AnalysisResult } from '../types';
 */

// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  authProvider?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ─── Resume / Analysis ────────────────────────────────────────────────────────
export interface AnalysisResult {
  readiness_score?: number;
  skills?: string[];
  score_breakdown?: Record<string, number>;
  career_paths?: CareerPath[];
  suggestions?: string[];
  [key: string]: unknown;
}

export interface CareerPath {
  title: string;
  match?: number;
  skills?: string[];
}

// ─── ATS ──────────────────────────────────────────────────────────────────────
export interface ATSResult {
  ats_score?: number;
  pass?: boolean;
  recommendations?: string[];
  [key: string]: unknown;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
