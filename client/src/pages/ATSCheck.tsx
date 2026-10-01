import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import KeyboardOutlinedIcon from '@mui/icons-material/KeyboardOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import apiService from '../services/apiService';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface CheckResult {
    passed: boolean | null;
    suggestions: string[];
    flags?: string[];
    missing_sections?: string[];
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

// ─── Pillar definition ─────────────────────────────────────────────────────────
const PILLARS = [
    {
        key: 'formatting_risk' as const,
        icon: <IntegrationInstructionsOutlinedIcon sx={{ fontSize: 16 }} />,
        label: 'Formatting & Layout',
        desc: 'Detects multi-column layouts, tables, and graphics that confuse ATS parsers.',
    },
    {
        key: 'section_presence' as const,
        icon: <ArticleOutlinedIcon sx={{ fontSize: 16 }} />,
        label: 'Section Structure',
        desc: 'Verifies presence of Contact, Summary, Experience, Education, and Skills sections.',
    },
    {
        key: 'date_parseability' as const,
        icon: <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />,
        label: 'Date Parseability',
        desc: 'Validates date formats for accurate work timeline parsing by ATS systems.',
    },
    {
        key: 'keyword_match' as const,
        icon: <KeyboardOutlinedIcon sx={{ fontSize: 16 }} />,
        label: 'Keyword Density',
        desc: 'Calculates overlap of your skills against common job description keywords.',
    },
    {
        key: 'file_integrity' as const,
        icon: <ShieldOutlinedIcon sx={{ fontSize: 16 }} />,
        label: 'Text Integrity',
        desc: 'Audits for encoding corruption, non-ASCII glyphs, and garbled text.',
    },
] as const;

// ─── Sample content ─────────────────────────────────────────────────────────────
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

const SAMPLE_JD = `We are seeking a Senior Full Stack Engineer proficient in React, TypeScript, Node.js, Docker, AWS, and PostgreSQL to design scalable systems and automate CI/CD pipelines.`;

const DEFAULT_RESULT: ATSResult = {
    ats_score: 92,
    summary: 'ATS-Optimized Resume',
    summary_detail: 'Resume meets enterprise ATS standards with clear sections, strong keyword alignment, and clean formatting.',
    checks: {
        formatting_risk:   { passed: true,  suggestions: ['Single-column layout is parseable by all major ATS systems.'], flags: [] },
        section_presence:  { passed: true,  suggestions: ['All 5 core sections detected: Summary, Experience, Education, Skills, Contact.'], missing_sections: [] },
        date_parseability: { passed: true,  suggestions: ['Standard "Month Year" format parsed correctly.'], dates_found: 4, has_vague_dates: false },
        keyword_match:     { passed: true,  suggestions: ['Add Kubernetes and Terraform to boost cloud match.'], match_percent: 88, matched_keywords: ['React', 'TypeScript', 'Node.js', 'Docker', 'AWS', 'PostgreSQL', 'Python', 'CI/CD'], missing_keywords: ['Kubernetes', 'GraphQL'] },
        file_integrity:    { passed: true,  suggestions: ['Zero corrupted characters or special Unicode glyphs detected.'], has_garbled_text: false, non_ascii_ratio: 0.0 },
    },
    all_suggestions: [
        'Add quantifiable impact metrics (% gain, $ saved) to every bullet point.',
        'Include Kubernetes and Terraform to increase cloud infrastructure keyword density.',
        'Ensure LinkedIn URL is clean without tracking parameters.',
    ],
};

// ─── Shared glass card ──────────────────────────────────────────────────────────
function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box sx={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px',
            transition: 'all 0.22s ease',
            ...sx,
        }}>
            {children}
        </Box>
    );
}

// ─── Score ring (pure SVG) ──────────────────────────────────────────────────────
function ScoreRing({ score, size = 96 }: { score: number; size?: number }) {
    const sw = 7, r = (size / 2) - sw;
    const circ = 2 * Math.PI * r;
    const offset = ((100 - Math.min(100, score)) / 100) * circ;
    const color = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#f87171';

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography sx={{ fontSize: size > 80 ? '1.6rem' : '1rem', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {score}
                </Typography>
                <Typography sx={{ fontSize: '0.56rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', mt: 0.2 }}>
                    ATS Score
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Pillar row ─────────────────────────────────────────────────────────────────
function PillarRow({ pillar, result }: { pillar: typeof PILLARS[number]; result: CheckResult }) {
    const passed = result.passed !== false;
    const statusColor = passed ? '#4ade80' : '#f87171';

    // Build a concise metric string
    let metric = '';
    if (pillar.key === 'keyword_match' && result.match_percent != null) {
        metric = `${result.match_percent}% match`;
    } else if (pillar.key === 'date_parseability' && result.dates_found != null) {
        metric = `${result.dates_found} dates`;
    } else if (pillar.key === 'section_presence' && result.missing_sections != null) {
        metric = result.missing_sections.length === 0 ? 'All sections' : `${result.missing_sections.length} missing`;
    }

    return (
        <Box sx={{
            p: 2,
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.015)',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' },
        }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                {/* Status icon */}
                <Box sx={{
                    width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                    background: passed ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                    border: `1px solid ${passed ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: statusColor,
                }}>
                    {passed
                        ? <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                        : <ErrorOutlineIcon sx={{ fontSize: 14 }} />
                    }
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                            <Box sx={{ color: 'rgba(255,255,255,0.3)', display: 'flex' }}>{pillar.icon}</Box>
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                                {pillar.label}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {metric && (
                                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>
                                    {metric}
                                </Typography>
                            )}
                            <Chip
                                label={passed ? 'Pass' : 'Fail'}
                                size="small"
                                sx={{
                                    height: 18, fontSize: '0.6rem', fontWeight: 700,
                                    background: passed ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                                    color: statusColor,
                                    border: `1px solid ${passed ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
                                }}
                            />
                        </Box>
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5, mb: 0.8 }}>
                        {pillar.desc}
                    </Typography>

                    {/* Keyword chips for keyword_match pillar */}
                    {pillar.key === 'keyword_match' && (
                        <>
                            {result.matched_keywords && result.matched_keywords.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.8 }}>
                                    {result.matched_keywords.map(kw => (
                                        <Chip key={kw} label={kw} size="small" sx={{
                                            height: 18, fontSize: '0.6rem', fontWeight: 600,
                                            background: 'rgba(74,222,128,0.08)', color: 'rgba(74,222,128,0.85)',
                                            border: '1px solid rgba(74,222,128,0.2)',
                                        }} />
                                    ))}
                                    {result.missing_keywords?.map(kw => (
                                        <Chip key={kw} label={kw} size="small" sx={{
                                            height: 18, fontSize: '0.6rem', fontWeight: 600,
                                            background: 'rgba(248,113,113,0.06)', color: 'rgba(248,113,113,0.6)',
                                            border: '1px solid rgba(248,113,113,0.15)',
                                        }} />
                                    ))}
                                </Box>
                            )}
                        </>
                    )}

                    {/* Suggestion */}
                    {result.suggestions[0] && (
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, fontStyle: 'italic' }}>
                            → {result.suggestions[0]}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

// ─── Main page ──────────────────────────────────────────────────────────────────
export default function ATSCheck() {
    const [resumeText,    setResumeText]    = useState(SAMPLE_RESUME);
    const [jobDesc,       setJobDesc]       = useState(SAMPLE_JD);
    const [loading,       setLoading]       = useState(false);
    const [result,        setResult]        = useState<ATSResult | null>(DEFAULT_RESULT);
    const [error,         setError]         = useState('');
    const [mounted,       setMounted]       = useState(false);
    const [copiedIdx,     setCopiedIdx]     = useState<number | null>(null);

    // Pre-fill resume text from last analysis if available
    useEffect(() => {
        setMounted(true);
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
            setError('Please provide at least 50 characters of resume text.');
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
            setError(err instanceof Error ? err.message : 'ATS check failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
    };

    const passCount = result
        ? Object.values(result.checks).filter(c => c.passed !== false).length
        : 0;

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>

            {/* ── Page Header ── */}
            <Box sx={{ mb: 5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                    Resume Intelligence
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', mb: 0.8, fontSize: { xs: '1.6rem', md: '2.125rem' } }}>
                    ATS Compatibility Audit
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', maxWidth: 480 }}>
                    Five-pillar analysis — formatting, sections, dates, keyword density, and text integrity.
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 380px' }, gap: 3, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.04s' }}>

                {/* ── Left — Input panel ── */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                    {/* Resume textarea */}
                    <GlassCard sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ArticleOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />
                                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
                                    Resume Text
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    size="small" variant="text"
                                    onClick={() => { setResumeText(SAMPLE_RESUME); setJobDesc(SAMPLE_JD); }}
                                    sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'none', minHeight: 26, '&:hover': { color: '#fff' } }}
                                >
                                    Use Sample
                                </Button>
                                <Button
                                    size="small" variant="text"
                                    onClick={() => { setResumeText(''); setJobDesc(''); setError(''); }}
                                    sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'none', minHeight: 26, '&:hover': { color: '#fff' } }}
                                >
                                    Clear
                                </Button>
                            </Box>
                        </Box>

                        <TextField
                            multiline
                            rows={12}
                            fullWidth
                            placeholder="Paste your resume text here — plain text works best. Minimum 50 characters."
                            value={resumeText}
                            onChange={e => { setResumeText(e.target.value); if (error) setError(''); }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px',
                                    fontSize: '0.82rem',
                                    lineHeight: 1.65,
                                    color: 'rgba(255,255,255,0.75)',
                                    fontFamily: 'monospace',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
                                    '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.3)', borderWidth: '1px' },
                                },
                                '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.18)', fontSize: '0.8rem' },
                            }}
                        />
                        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', mt: 1, textAlign: 'right' }}>
                            {resumeText.trim().length.toLocaleString()} characters
                        </Typography>
                    </GlassCard>

                    {/* Job description */}
                    <GlassCard sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <WorkOutlineIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
                                Target Job Description
                            </Typography>
                            <Chip label="Optional" size="small" sx={{ height: 16, fontSize: '0.58rem', fontWeight: 700, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }} />
                        </Box>
                        <TextField
                            multiline
                            rows={4}
                            fullWidth
                            placeholder="Paste the job description to boost keyword matching accuracy. Leave blank for a general ATS audit."
                            value={jobDesc}
                            onChange={e => setJobDesc(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '12px',
                                    fontSize: '0.82rem',
                                    lineHeight: 1.65,
                                    color: 'rgba(255,255,255,0.7)',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
                                    '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.3)', borderWidth: '1px' },
                                },
                                '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.18)', fontSize: '0.8rem' },
                            }}
                        />
                    </GlassCard>

                    {/* Error */}
                    {error && (
                        <Alert severity="error" sx={{ borderRadius: '12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: 'rgba(248,113,113,0.85)' }}>
                            {error}
                        </Alert>
                    )}

                    {/* Run button */}
                    <Button
                        variant="contained"
                        fullWidth
                        disabled={loading || resumeText.trim().length < 50}
                        onClick={handleRun}
                        startIcon={loading ? <CircularProgress size={16} sx={{ color: '#0a0a0a' }} /> : <BoltOutlinedIcon />}
                        sx={{
                            height: 48, borderRadius: '13px',
                            background: '#ffffff', color: '#0a0a0a',
                            fontWeight: 700, fontSize: '0.9rem', textTransform: 'none',
                            boxShadow: '0 4px 20px rgba(255,255,255,0.12)',
                            '&:hover': { background: '#e8e8e8', transform: 'translateY(-1px)', boxShadow: '0 8px 28px rgba(255,255,255,0.2)' },
                            '&.Mui-disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.25)' },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {loading ? 'Running ATS Audit…' : 'Run ATS Audit'}
                    </Button>
                </Box>

                {/* ── Right — Results panel ── */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                    {/* Score summary card */}
                    {result && (
                        <>
                            <GlassCard sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <ScoreRing score={result.ats_score} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', mb: 0.4, letterSpacing: '-0.02em' }}>
                                            {result.summary}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                                            {result.summary_detail}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />

                                {/* 5 mini stat pills */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
                                    {PILLARS.map(p => {
                                        const check = result.checks[p.key];
                                        const ok = check.passed !== false;
                                        return (
                                            <Box key={p.key} sx={{
                                                textAlign: 'center', p: 1, borderRadius: '10px',
                                                background: ok ? 'rgba(74,222,128,0.06)' : 'rgba(248,113,113,0.06)',
                                                border: `1px solid ${ok ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}`,
                                            }}>
                                                <Box sx={{ color: ok ? 'rgba(74,222,128,0.7)' : 'rgba(248,113,113,0.7)', display: 'flex', justifyContent: 'center', mb: 0.4 }}>
                                                    {ok ? <CheckCircleOutlineIcon sx={{ fontSize: 13 }} /> : <ErrorOutlineIcon sx={{ fontSize: 13 }} />}
                                                </Box>
                                                <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 1.3 }}>
                                                    {p.label.split(' ')[0]}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>

                                {/* Overall progress */}
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>Checks Passed</Typography>
                                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>{passCount} / 5</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={(passCount / 5) * 100}
                                        sx={{
                                            height: 4, borderRadius: 2,
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            '& .MuiLinearProgress-bar': {
                                                background: passCount >= 4 ? 'rgba(74,222,128,0.7)' : passCount >= 3 ? 'rgba(250,204,21,0.6)' : 'rgba(248,113,113,0.6)',
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Box>
                            </GlassCard>

                            {/* 5 Pillar detailed rows */}
                            <GlassCard sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <AssessmentOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />
                                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
                                        5-Pillar Breakdown
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {PILLARS.map(p => (
                                        <PillarRow key={p.key} pillar={p} result={result.checks[p.key]} />
                                    ))}
                                </Box>
                            </GlassCard>

                            {/* Action suggestions */}
                            {result.all_suggestions.length > 0 && (
                                <GlassCard sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <AutoFixHighOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />
                                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
                                            Optimisation Actions
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {result.all_suggestions.map((s, i) => (
                                            <Box key={i} sx={{
                                                display: 'flex', alignItems: 'flex-start', gap: 1.5,
                                                p: 1.5, borderRadius: '10px',
                                                background: 'rgba(255,255,255,0.015)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                            }}>
                                                <LightbulbOutlinedIcon sx={{ fontSize: 13, color: 'rgba(250,204,21,0.6)', mt: 0.15, flexShrink: 0 }} />
                                                <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, flex: 1 }}>
                                                    {s}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleCopy(s, i)}
                                                    sx={{ color: 'rgba(255,255,255,0.2)', p: 0.3, '&:hover': { color: '#fff' } }}
                                                >
                                                    {copiedIdx === i
                                                        ? <CheckIcon sx={{ fontSize: 12, color: '#4ade80' }} />
                                                        : <ContentCopyIcon sx={{ fontSize: 12 }} />
                                                    }
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Box>
                                </GlassCard>
                            )}
                        </>
                    )}

                    {/* Empty state (before first run) */}
                    {!result && !loading && (
                        <GlassCard sx={{ p: 4, textAlign: 'center' }}>
                            <ShieldOutlinedIcon sx={{ fontSize: 32, color: 'rgba(255,255,255,0.1)', mb: 1.5 }} />
                            <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', mb: 0.5, fontWeight: 600 }}>
                                Results will appear here
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.76rem', lineHeight: 1.6 }}>
                                Paste your resume text and click Run ATS Audit to get a detailed 5-pillar breakdown.
                            </Typography>
                        </GlassCard>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
