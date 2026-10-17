import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import apiService from '../services/apiService';
import ATSSphere from '../components/charts/ATSSphere';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CheckResult {
    passed: boolean | null;
    suggestions: string[];
    flags?: string[];
    missing_sections?: string[];
    found_sections?: string[];
    dates_found?: number;
    has_vague_dates?: boolean;
    match_percent?: number | null;
    matched_keywords?: string[];
    missing_keywords?: string[];
    has_garbled_text?: boolean;
    non_ascii_ratio?: number;
}

interface ATSResult {
    ats_score: number;
    summary: string;
    summary_detail: string;
    checks: {
        formatting_risk:  CheckResult;
        section_presence: CheckResult;
        date_parseability: CheckResult;
        keyword_match:    CheckResult;
        file_integrity:   CheckResult;
    };
    all_suggestions: string[];
}


// ─── Preset Sample Data ────────────────────────────────────────────────────────
const SAMPLE_RESUME = `ALEXANDER WRIGHT
San Francisco, CA • alex.wright@email.com • (555) 234-5678 • linkedin.com/in/alexwright

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 5+ years of experience designing and scaling distributed web applications, RESTful APIs, and cloud microservices. Proficient in React, TypeScript, Node.js, Python, and PostgreSQL.

WORK EXPERIENCE
Senior Software Engineer | TechNova Solutions | Jan 2022 – Present
- Architected microservices using Node.js, Express, and Docker, reducing API latency by 35%.
- Led React 18 + TypeScript frontend redesign, increasing user retention by 22%.
- Built CI/CD pipelines with GitHub Actions and AWS ECS.

Software Engineer | CloudScale Inc | Jun 2019 – Dec 2021
- Developed Python FastAPI services handling 1M+ requests/day with PostgreSQL.
- Implemented Redis caching layer, cutting database load by 60%.

EDUCATION
Bachelor of Science in Computer Science | UC Berkeley | 2015 – 2019

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frameworks: React, Node.js, FastAPI, Express
Cloud & DevOps: Docker, AWS, GitHub Actions, CI/CD, Linux
Databases: PostgreSQL, MongoDB, Redis`;

const SAMPLE_JD = `We are seeking a Senior Full Stack Engineer proficient in React, TypeScript, Node.js, Docker, AWS, and PostgreSQL to design scalable systems and automate CI/CD pipelines. Experience with Kubernetes, GraphQL, and microservices is a strong plus.`;

const DEFAULT_RESULT: ATSResult = {
    ats_score: 92,
    summary: 'ATS-Optimized Resume',
    summary_detail: 'Linear layout, clear chronology, and strong semantic keyword overlap.',
    checks: {
        formatting_risk:   { passed: true,  suggestions: ['Single-column layout parsed cleanly.'], flags: [] },
        section_presence:  { passed: true,  suggestions: ['All 5 standard sections detected.'], missing_sections: [], found_sections: ['Contact', 'Summary', 'Experience', 'Education', 'Skills'] },
        date_parseability: { passed: true,  suggestions: ['Standard chronology detected.'], dates_found: 4, has_vague_dates: false },
        keyword_match:     { passed: true,  suggestions: ['Add Kubernetes and GraphQL to reach 100% coverage.'], match_percent: 86, matched_keywords: ['React', 'TypeScript', 'Node.js', 'Docker', 'AWS', 'PostgreSQL', 'Python', 'CI/CD'], missing_keywords: ['Kubernetes', 'GraphQL', 'Microservices Architecture'] },
        file_integrity:    { passed: true,  suggestions: ['Valid UTF-8 encoding confirmed.'], has_garbled_text: false, non_ascii_ratio: 0.0 },
    },
    all_suggestions: [
        'Add quantifiable impact metrics (% gain, throughput numbers) to every experience bullet.',
        'Integrate missing target keywords: Kubernetes and GraphQL.',
    ],
};

// ─── Enhanced Monochromatic Glass Card ─────────────────────────────────────────
function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box sx={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
                borderColor: 'rgba(255,255,255,0.14)',
            },
            ...sx,
        }}>
            {children}
        </Box>
    );
}


// ─── Extract Local Keywords & Cross-Match Helper ───────────────────────────────
function calculateStrictAlignment(cvText: string, jdText: string, serverResult: ATSResult | null) {
    if (!jdText.trim()) {
        const score = serverResult?.ats_score ?? 90;
        return {
            matchPercent: serverResult?.checks.keyword_match.match_percent ?? 85,
            score,
            isSevereMismatch: false,
            matched: serverResult?.checks.keyword_match.matched_keywords ?? ['React', 'TypeScript', 'Node.js'],
            missing: serverResult?.checks.keyword_match.missing_keywords ?? [],
        };
    }

    const rawTokens = jdText
        .replace(/[^\w\s+#.-]/g, ' ')
        .split(/\s+/)
        .map(t => t.trim())
        .filter(t => t.length >= 3 && !/^(and|the|with|for|that|this|have|from|will|your|about|into|more|must)$/i.test(t));

    const targetSet = Array.from(new Set(rawTokens.map(t => t.toLowerCase())));
    const cvLower = cvText.toLowerCase();

    const matchedTokens: string[] = [];
    const missingTokens: string[] = [];

    targetSet.forEach(term => {
        if (cvLower.includes(term)) {
            matchedTokens.push(term);
        } else {
            missingTokens.push(term);
        }
    });

    const total = targetSet.length || 1;
    const computedMatch = Math.round((matchedTokens.length / total) * 100);

    const finalMatched = serverResult?.checks.keyword_match.matched_keywords?.length
        ? serverResult.checks.keyword_match.matched_keywords
        : matchedTokens.slice(0, 12).map(w => w.charAt(0).toUpperCase() + w.slice(1));

    const finalMissing = serverResult?.checks.keyword_match.missing_keywords?.length
        ? serverResult.checks.keyword_match.missing_keywords
        : missingTokens.slice(0, 10).map(w => w.charAt(0).toUpperCase() + w.slice(1));

    const matchPercent = serverResult?.checks.keyword_match.match_percent != null
        ? serverResult.checks.keyword_match.match_percent
        : computedMatch;

    const isSevereMismatch = matchPercent < 50;

    let score = serverResult?.ats_score ?? 88;
    if (isSevereMismatch) {
        score = Math.min(score, Math.max(25, Math.round(matchPercent * 0.9)));
    }

    return {
        matchPercent,
        score,
        isSevereMismatch,
        matched: finalMatched,
        missing: finalMissing,
    };
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ATSCheck() {
    const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
    const [jobDesc, setJobDesc]       = useState(SAMPLE_JD);
    const [loading, setLoading]       = useState(false);
    const [result, setResult]         = useState<ATSResult | null>(DEFAULT_RESULT);
    const [error, setError]           = useState('');

    useEffect(() => {
        try {
            const raw = localStorage.getItem('last_analysis');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.resume_text && typeof parsed.resume_text === 'string' && parsed.resume_text.length >= 50) {
                    setResumeText(parsed.resume_text);
                }
            }
        } catch { /* ignore */ }
    }, []);

    const handleRun = async () => {
        if (resumeText.trim().length < 50) {
            setError('Please provide at least 50 characters of CV text.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await apiService.post<ATSResult>('/api/ats-check', {
                resume: resumeText.trim(),
                target_role: jobDesc.trim() || undefined,
            });
            setResult(res);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'ATS check failed. Please verify connection.');
        } finally {
            setLoading(false);
        }
    };

    const alignment = useMemo(() => {
        return calculateStrictAlignment(resumeText, jobDesc, result);
    }, [resumeText, jobDesc, result]);

    return (
        <Box sx={{
            minHeight: '100vh',
            background: '#0a0a0a',
            py: { xs: 2.5, md: 3 },
            px: { xs: 2, sm: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            boxSizing: 'border-box',
        }}>

            {/* ── Prominent Hero Header ── */}
            <Box sx={{ pb: 0.5 }}>
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.16em', textTransform: 'uppercase', mb: 0.4 }}>
                    Resume Intelligence & Diagnostic Audit
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1.15, fontSize: { xs: '1.85rem', sm: '2.2rem', md: '2.5rem' } }}>
                    ATS Compatibility & Job Alignment
                </Typography>
            </Box>

            {/* ── SECTION 1: Dual Input Studio (100% Identical Structure, Weight & Height) ── */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                gap: 2,
            }}>
                {/* 1. CV Text Input Card */}
                <GlassCard sx={{ p: 2.2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <ArticleOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.45)' }} />
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                                Curriculum Vitae (CV) Description
                            </Typography>
                            <Chip
                                label={`${resumeText.trim().length} chars`}
                                size="small"
                                sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                            />
                        </Box>
                        <Button
                            size="small" variant="text"
                            onClick={() => { setResumeText(''); setError(''); }}
                            sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'none', py: 0.2, minHeight: 24, '&:hover': { color: '#ffffff' } }}
                        >
                            Clear
                        </Button>
                    </Box>

                    <TextField
                        multiline
                        rows={7}
                        fullWidth
                        placeholder="Paste plain text content from your CV / Resume here..."
                        value={resumeText}
                        onChange={e => { setResumeText(e.target.value); if (error) setError(''); }}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                background: 'rgba(0,0,0,0.4)',
                                borderRadius: '12px',
                                fontSize: '0.73rem',
                                lineHeight: 1.55,
                                color: 'rgba(255,255,255,0.85)',
                                fontFamily: 'inherit',
                                fontWeight: 400,
                                letterSpacing: '0.01em',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.16)' },
                                '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.3)', borderWidth: '1px' },
                            },
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.8 }}>
                        <Typography sx={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                            {resumeText.trim().split(/\s+/).filter(Boolean).length} words
                        </Typography>
                    </Box>
                </GlassCard>

                {/* 2. Job Description Input Card (Identical Height & Structure) */}
                <GlassCard sx={{ p: 2.2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <WorkOutlineIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.45)' }} />
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff' }}>
                                Target Job Description (JD)
                            </Typography>
                            <Chip
                                label={`${jobDesc.trim().length} chars`}
                                size="small"
                                sx={{ height: 18, fontSize: '0.6rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
                            />
                        </Box>
                        <Button
                            size="small" variant="text"
                            onClick={() => setJobDesc('')}
                            sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', textTransform: 'none', py: 0.2, minHeight: 24, '&:hover': { color: '#ffffff' } }}
                        >
                            Clear
                        </Button>
                    </Box>

                    <TextField
                        multiline
                        rows={7}
                        fullWidth
                        placeholder="Paste target job description or requirements to cross-verify role alignment..."
                        value={jobDesc}
                        onChange={e => setJobDesc(e.target.value)}
                        sx={{
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                                background: 'rgba(0,0,0,0.4)',
                                borderRadius: '12px',
                                fontSize: '0.73rem',
                                lineHeight: 1.55,
                                color: 'rgba(255,255,255,0.85)',
                                fontFamily: 'inherit',
                                fontWeight: 400,
                                letterSpacing: '0.01em',
                                '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.16)' },
                                '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.3)', borderWidth: '1px' },
                            },
                        }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 0.8 }}>
                        <Typography sx={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                            {jobDesc.trim().split(/\s+/).filter(Boolean).length} words
                        </Typography>
                    </Box>
                </GlassCard>
            </Box>

            {/* Run Button (Monochromatic High-Contrast Style) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    variant="contained"
                    fullWidth
                    disabled={loading || resumeText.trim().length < 50}
                    onClick={handleRun}
                    startIcon={loading ? <CircularProgress size={16} sx={{ color: '#0a0a0a' }} /> : <BoltOutlinedIcon sx={{ fontSize: 18 }} />}
                    sx={{
                        height: 44,
                        borderRadius: '12px',
                        background: '#ffffff',
                        color: '#0a0a0a',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        textTransform: 'none',
                        letterSpacing: '-0.01em',
                        boxShadow: '0 4px 20px rgba(255,255,255,0.1)',
                        '&:hover': { background: '#ebebeb', transform: 'translateY(-1px)', boxShadow: '0 6px 24px rgba(255,255,255,0.18)' },
                        '&.Mui-disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' },
                        transition: 'all 0.2s ease',
                    }}
                >
                    {loading ? 'Checking ATS score…' : 'Check ATS score'}
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ py: 0.5, borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.18)', color: '#ffffff' }}>
                    {error}
                </Alert>
            )}

            {/* ── SECTION 2: Focused Monochromatic Results Studio ── */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '340px 1fr' },
                gap: 2,
                flex: 1,
            }}>
                {/* Left Card: 3D Animated Sphere Card displaying ATS Score */}
                <ATSSphere
                    score={alignment.score}
                    matchPercent={alignment.matchPercent}
                    isSevereMismatch={alignment.isSevereMismatch}
                />

                {/* Right Card: Minimal Keyword Match & Density (Space-Fitting Layout) */}
                <GlassCard sx={{ p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 1.8, height: '100%' }}>
                    {/* Minimal Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <KeyboardOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                                Keywords
                            </Typography>
                        </Box>
                        <Chip
                            label={`${alignment.matchPercent}%`}
                            size="small"
                            sx={{
                                height: 22,
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                background: 'rgba(255,255,255,0.08)',
                                color: '#ffffff',
                                border: '1px solid rgba(255,255,255,0.18)',
                            }}
                        />
                    </Box>

                    {/* Minimal Visual Track Bar */}
                    <Box sx={{ width: '100%', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                        <Box
                            sx={{
                                width: `${Math.min(100, Math.max(0, alignment.matchPercent))}%`,
                                height: '100%',
                                background: alignment.score >= 80 ? '#ffffff' : alignment.score >= 60 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
                                borderRadius: 2,
                                transition: 'width 0.4s ease',
                            }}
                        />
                    </Box>

                    {/* Matched Keywords Grid/Cloud */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: '#ffffff' }} />
                            <Typography sx={{ fontSize: '0.64rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                Matched ({alignment.matched.length})
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, flex: 1, minHeight: 70, maxHeight: 115, overflowY: 'auto' }}>
                            {alignment.matched.length > 0 ? (
                                alignment.matched.map(kw => (
                                    <Chip
                                        key={kw}
                                        label={kw}
                                        size="small"
                                        icon={<CheckIcon sx={{ fontSize: '11px !important', color: '#ffffff !important' }} />}
                                        sx={{
                                            height: 22,
                                            fontSize: '0.68rem',
                                            fontWeight: 600,
                                            background: 'rgba(255,255,255,0.07)',
                                            color: '#ffffff',
                                            border: '1px solid rgba(255,255,255,0.16)',
                                        }}
                                    />
                                ))
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', height: 32 }}>
                                    <Typography sx={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.3)' }}>
                                        None
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Missing Keywords Grid/Cloud */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.8, pt: 1, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' }} />
                                <Typography sx={{ fontSize: '0.64rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Missing ({alignment.missing.length})
                                </Typography>
                            </Box>
                            {alignment.missing.length > 0 && (
                                <Tooltip title="Copy all missing">
                                    <IconButton
                                        size="small"
                                        onClick={() => navigator.clipboard.writeText(alignment.missing.join(', '))}
                                        sx={{ p: 0.3, color: 'rgba(255,255,255,0.35)', '&:hover': { color: '#ffffff' } }}
                                    >
                                        <ContentCopyIcon sx={{ fontSize: 13 }} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, flex: 1, minHeight: 70, maxHeight: 115, overflowY: 'auto' }}>
                            {alignment.missing.length > 0 ? (
                                alignment.missing.map(kw => (
                                    <Chip
                                        key={kw}
                                        label={kw}
                                        size="small"
                                        sx={{
                                            height: 22,
                                            fontSize: '0.68rem',
                                            fontWeight: 500,
                                            background: 'rgba(255,255,255,0.025)',
                                            color: 'rgba(255,255,255,0.65)',
                                            border: '1px dashed rgba(255,255,255,0.16)',
                                        }}
                                    />
                                ))
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', height: 32 }}>
                                    <Typography sx={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.3)' }}>
                                        None
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </GlassCard>
            </Box>
        </Box>
    );
}
