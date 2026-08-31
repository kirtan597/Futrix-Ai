import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SecurityIcon from '@mui/icons-material/Security';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';

import { motion, AnimatePresence } from 'framer-motion';
import { atsCheck } from '../services/api';
import ATSBalanceRadar, { ATSPillarData } from '../components/charts/ATSBalanceRadar';
import ATSPillarPerformance from '../components/charts/ATSPillarPerformance';
import ATSScoreRing from '../components/charts/ATSScoreRing';

// ─── Types ────────────────────────────────────────────────────────────────────
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
        formatting_risk: CheckResult;
        section_presence: CheckResult;
        date_parseability: CheckResult;
        keyword_match: CheckResult;
        file_integrity: CheckResult;
    };
    all_suggestions: string[];
}

const SAMPLE_RESUME = `ALEXANDER WRIGHT
San Francisco, CA • alex.wright@email.com • (555) 234-5678 • linkedin.com/in/alexwright

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 5+ years of experience designing and scaling distributed web applications, RESTful APIs, and cloud microservices. Proficient in React, TypeScript, Node.js, Python, and PostgreSQL.

WORK EXPERIENCE
Senior Software Engineer | TechNova Solutions | Jan 2022 – Present
- Architected and built high-concurrency microservices using Node.js, Express, and Docker, reducing latency by 35%.
- Led frontend redesign in React 18, TypeScript, and Tailwind CSS, increasing user retention by 22%.
- Designed CI/CD deployment pipelines using GitHub Actions and AWS ECS.

Software Engineer | CloudScale Inc | Jun 2019 – Dec 2021
- Developed RESTful API endpoints in Python and FastAPI, serving 1M+ daily active requests.
- Integrated Redis caching layer and optimized PostgreSQL relational database queries.
- Collaborated in an agile scrum team of 8 engineers delivering bi-weekly sprint releases.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2015 – 2019

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
Frameworks & Libraries: React, Node.js, Express, FastAPI, Redux, Material UI
Cloud & DevOps: Docker, AWS (S3, EC2, ECS), Git, GitHub Actions, CI/CD, Linux
Databases: PostgreSQL, MongoDB, Redis`;

const SAMPLE_JD = `We are looking for a Senior Full Stack Engineer proficient in React, TypeScript, Node.js, Docker, AWS, and PostgreSQL. You will design scalable web systems, automate CI/CD pipelines, and collaborate with cross-functional teams.`;

const INITIAL_DEFAULT_RESULT: ATSResult = {
    ats_score: 92,
    summary: "ATS-Optimized Resume Profile",
    summary_detail: "Your resume meets standard enterprise ATS benchmarks with clear chronological flow, complete section headers, zero formatting corruption, and strong technical keyword alignment.",
    checks: {
        formatting_risk: {
            passed: true,
            flags: [],
            suggestions: ["Format is clean single-column and easily parsable by Workday, Greenhouse, and Lever."]
        },
        section_presence: {
            passed: true,
            missing_sections: [],
            suggestions: ["All 5 core standard sections (Summary, Experience, Education, Skills, Contact) detected."]
        },
        date_parseability: {
            passed: true,
            dates_found: 4,
            has_vague_dates: false,
            suggestions: ["Standard Month Year format parsed correctly across all positions."]
        },
        keyword_match: {
            passed: true,
            match_percent: 88,
            matched_keywords: ["React", "TypeScript", "Node.js", "Docker", "AWS", "PostgreSQL", "Python", "CI/CD"],
            missing_keywords: ["Kubernetes", "GraphQL"],
            suggestions: ["Consider adding 'Kubernetes' and 'GraphQL' if you have hands-on experience."]
        },
        file_integrity: {
            passed: true,
            has_garbled_text: false,
            non_ascii_ratio: 0.0,
            suggestions: ["Zero corrupted characters or special Unicode glyphs detected."]
        }
    },
    all_suggestions: [
        "Include quantifiable impact metrics (% performance gain, $ saved) in all bullet points.",
        "Add target keywords 'Kubernetes' and 'Terraform' to boost cloud infrastructure match.",
        "Ensure LinkedIn URL in header is hyperlinked cleanly without tracking parameters."
    ]
};

const CHECK_META = [
    {
        key: 'formatting_risk' as const,
        label: 'Formatting & Layout Safety',
        desc: 'Detects tables, multi-column layouts, graphics, and unparseable layout elements.',
        icon: '📐',
    },
    {
        key: 'section_presence' as const,
        label: 'Section Structure & Headers',
        desc: 'Verifies standard resume sections: Contact, Summary, Experience, Education, Skills.',
        icon: '📋',
    },
    {
        key: 'date_parseability' as const,
        label: 'Date Parseability & Timeline',
        desc: 'Checks standard date formats (Month Year / ISO) for accurate work experience parsing.',
        icon: '📅',
    },
    {
        key: 'keyword_match' as const,
        label: 'Keyword Match & Density',
        desc: 'Calculates keyword overlap against industry targets and job descriptions.',
        icon: '🔍',
    },
    {
        key: 'file_integrity' as const,
        label: 'Encoding & Text Integrity',
        desc: 'Audits non-ASCII encoding, character corruption, and machine extraction health.',
        icon: '🔒',
    },
];

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box sx={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '20px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            transition: 'all 0.25s ease',
            ...sx,
        }}>
            {children}
        </Box>
    );
}

export default function ATSCheck() {
    const navigate = useNavigate();
    const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
    const [jobDescription, setJobDescription] = useState(SAMPLE_JD);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ATSResult | null>(INITIAL_DEFAULT_RESULT);
    const [error, setError] = useState('');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'recommended'>('all');

    // Load current analysis text from localStorage if available
    useEffect(() => {
        try {
            const raw = localStorage.getItem('last_analysis');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.resume_text && typeof parsed.resume_text === 'string' && parsed.resume_text.length >= 50) {
                    setResumeText(parsed.resume_text);
                }
            }
        } catch {
            // Ignore parse errors
        }
    }, []);

    const handleUseSample = () => {
        setResumeText(SAMPLE_RESUME);
        setJobDescription(SAMPLE_JD);
        setError('');
    };

    const handleClear = () => {
        setResumeText('');
        setJobDescription('');
        setError('');
    };

    const handleCopy = (text: string, idx: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleSubmit = async () => {
        if (!resumeText.trim() || resumeText.trim().length < 50) {
            setError('Please provide at least 50 characters of resume text to run the audit.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await atsCheck({
                resume: resumeText.trim(),
                target_role: jobDescription.trim() || undefined,
            });
            setResult(res.data as ATSResult);
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'ATS check failed. Please check your connection and try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Prepare structured 5-Pillar data for Radar & Bar Charts
    const pillarData: ATSPillarData[] = result ? [
        {
            pillar: 'Formatting',
            label: 'Layout & Formatting',
            score: result.checks.formatting_risk.passed ? 95 : 35,
            fullMark: 100,
            status: result.checks.formatting_risk.passed ? 'optimal' : 'risk',
            description: result.checks.formatting_risk.passed ? 'Zero unparseable tables or columns' : 'Layout risks detected in resume structure',
            icon: '📐',
        },
        {
            pillar: 'Sections',
            label: 'Standard Sections',
            score: result.checks.section_presence.passed ? 90 : Math.max(25, 90 - (result.checks.section_presence.missing_sections?.length || 0) * 20),
            fullMark: 100,
            status: result.checks.section_presence.passed ? 'optimal' : 'moderate',
            description: result.checks.section_presence.missing_sections?.length ? `Missing: ${result.checks.section_presence.missing_sections.join(', ')}` : 'All 5 core standard sections present',
            icon: '📋',
        },
        {
            pillar: 'Dates',
            label: 'Date Parseability',
            score: result.checks.date_parseability.passed ? 90 : (result.checks.date_parseability.dates_found ? 65 : 30),
            fullMark: 100,
            status: result.checks.date_parseability.passed ? 'optimal' : 'moderate',
            description: result.checks.date_parseability.passed ? `${result.checks.date_parseability.dates_found || 0} standard dates parsed` : 'Non-standard or vague date formats detected',
            icon: '📅',
        },
        {
            pillar: 'Keywords',
            label: 'Keyword Match',
            score: result.checks.keyword_match.match_percent ?? (result.checks.keyword_match.passed ? 85 : 45),
            fullMark: 100,
            status: (result.checks.keyword_match.match_percent || 0) >= 75 ? 'optimal' : (result.checks.keyword_match.match_percent || 0) >= 50 ? 'moderate' : 'risk',
            description: `${result.checks.keyword_match.matched_keywords?.length || 0} matched technical keywords`,
            icon: '🔍',
        },
        {
            pillar: 'Integrity',
            label: 'Encoding Integrity',
            score: result.checks.file_integrity.passed ? 100 : 40,
            fullMark: 100,
            status: result.checks.file_integrity.passed ? 'optimal' : 'risk',
            description: result.checks.file_integrity.passed ? '100% clean UTF-8 plain text' : 'Corrupted or non-ASCII characters found',
            icon: '🔒',
        },
    ] : [];

    const scoreStatus = result
        ? result.ats_score >= 80 ? 'ATS-Optimized (Application Ready)'
            : result.ats_score >= 60 ? 'Moderate Compatibility (Review Suggestions)'
                : result.ats_score >= 40 ? 'Significant Parsing Risks'
                    : 'Critical ATS Parsing Failure'
        : '';

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 4, lg: 8 } }}>
            {/* Top Navigation & Breadcrumb */}
            <Box sx={{ maxWidth: 1200, mx: 'auto', mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.8 }}>
                        <Chip
                            icon={<AutoAwesomeIcon sx={{ fontSize: '13px !important', color: 'rgba(255,255,255,0.85)' }} />}
                            label="Deterministic NLP Engine"
                            size="small"
                            sx={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.12)', fontWeight: 700, fontSize: '0.72rem' }}
                        />
                        <Chip
                            icon={<SecurityIcon sx={{ fontSize: '13px !important', color: 'rgba(255,255,255,0.6)' }} />}
                            label="5-Pillar ATS Compatibility Audit"
                            size="small"
                            sx={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, fontSize: '0.72rem' }}
                        />
                    </Box>
                    <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' }, fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1, color: '#ffffff' }}>
                        ATS Compatibility Audit
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', mt: 0.5 }}>
                        Verify machine parseability, layout safety, date normalization, section presence, and keyword density.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={handleUseSample}
                        sx={{
                            borderColor: 'rgba(255,255,255,0.15)',
                            color: 'rgba(255,255,255,0.85)',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            '&:hover': { borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)' }
                        }}
                    >
                        Load Sample Resume
                    </Button>
                    {result && (
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PrintOutlinedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => window.print()}
                            sx={{
                                borderColor: 'rgba(255,255,255,0.15)',
                                color: 'rgba(255,255,255,0.85)',
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                '&:hover': { borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)' }
                            }}
                        >
                            Print Report
                        </Button>
                    )}
                </Box>
            </Box>

            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                {/* Input Form Section */}
                <GlassCard sx={{ p: { xs: 2.5, md: 3.5 }, mb: 4 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 3 }}>
                        {/* Resume Text Input */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ArticleOutlinedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)' }}>
                                        Resume Text / Content
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: '0.75rem', color: resumeText.length >= 50 ? '#ffffff' : 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                                    {resumeText.length} chars (min 50)
                                </Typography>
                            </Box>
                            <TextField
                                multiline
                                rows={7}
                                fullWidth
                                placeholder="Paste your complete resume text here (contact info, experience, education, skills)..."
                                value={resumeText}
                                onChange={(e) => {
                                    setResumeText(e.target.value);
                                    if (error) setError('');
                                }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        background: 'rgba(0,0,0,0.35)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '0.88rem',
                                        fontFamily: 'monospace',
                                        lineHeight: 1.5,
                                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                                        '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.8)', borderWidth: '1.5px' },
                                    }
                                }}
                            />
                        </Box>

                        {/* Target Job Description (Optional) */}
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WorkOutlineIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.6)' }} />
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: 'rgba(255,255,255,0.9)' }}>
                                        Target Role / Job Description <Typography component="span" sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>(Optional)</Typography>
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                                    {jobDescription.length} chars
                                </Typography>
                            </Box>
                            <TextField
                                multiline
                                rows={7}
                                fullWidth
                                placeholder="Paste a target job description to calculate exact ATS keyword alignment, match %, and missing keywords..."
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        background: 'rgba(0,0,0,0.35)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '0.88rem',
                                        fontFamily: 'monospace',
                                        lineHeight: 1.5,
                                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                                        '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.8)', borderWidth: '1.5px' },
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mt: 3, borderRadius: '12px', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                            {error}
                        </Alert>
                    )}

                    {/* Form Action Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, flexWrap: 'wrap', gap: 1.5 }}>
                        <Button
                            variant="text"
                            size="small"
                            onClick={handleClear}
                            disabled={loading || (!resumeText && !jobDescription)}
                            sx={{ color: 'rgba(255,255,255,0.45)', textTransform: 'none', fontSize: '0.82rem', '&:hover': { color: '#fff' }, minHeight: 40 }}
                        >
                            Clear Form
                        </Button>

                        <Button
                            id="run-ats-audit-btn"
                            variant="contained"
                            size="large"
                            disabled={loading || resumeText.trim().length < 50}
                            onClick={handleSubmit}
                            sx={{
                                width: { xs: '100%', sm: 'auto' },
                                background: 'linear-gradient(135deg, #ffffff 0%, #d4d4d4 100%)',
                                color: '#0a0a0a',
                                fontWeight: 800,
                                px: { xs: 2.5, sm: 4 },
                                py: 1.3,
                                minHeight: 48,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontSize: '0.92rem',
                                boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
                                '&:hover': {
                                    background: '#e5e5e5',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 6px 28px rgba(255,255,255,0.25)'
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                                    <CircularProgress size={18} sx={{ color: '#0a0a0a' }} />
                                    <span>Auditing 5 ATS Pillars...</span>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                    <span>Run 5-Pillar ATS Audit</span>
                                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                                </Box>
                            )}
                        </Button>
                    </Box>
                </GlassCard>

                {/* Audit Results Section */}
                <AnimatePresence>
                    {result && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Score Overview Hero Banner */}
                            <GlassCard sx={{ p: { xs: 3, md: 4 }, mb: 4, position: 'relative', overflow: 'hidden' }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    width: 320,
                                    height: 320,
                                    background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)',
                                    pointerEvents: 'none',
                                }} />

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' }, gap: 3.5, alignItems: 'center' }}>
                                    {/* Pure SVG Radial Score Meter */}
                                    <Box sx={{ textAlign: 'center' }}>
                                        <ATSScoreRing score={result.ats_score} size={150} />
                                    </Box>

                                    {/* Summary & Key Metrics */}
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                                            <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                                                {result.summary}
                                            </Typography>
                                            <Chip
                                                label={scoreStatus}
                                                size="small"
                                                sx={{
                                                    background: 'rgba(255,255,255,0.08)',
                                                    color: '#ffffff',
                                                    border: '1px solid rgba(255,255,255,0.18)',
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        </Box>

                                        <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.92rem', lineHeight: 1.6, mb: 2.5 }}>
                                            {result.summary_detail}
                                        </Typography>

                                        {/* Quick Metrics Badges in Monochrome */}
                                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1.5 }}>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Formatting</Typography>
                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                                                    {result.checks.formatting_risk.passed ? 'Optimal' : 'Risks Detected'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Sections</Typography>
                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                                                    {result.checks.section_presence.missing_sections?.length ? `${5 - result.checks.section_presence.missing_sections.length}/5 Found` : '5/5 Complete'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Dates Parsed</Typography>
                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                                                    {result.checks.date_parseability.dates_found || 0} Standard
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Keyword Match</Typography>
                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                                                    {result.checks.keyword_match.match_percent !== null && result.checks.keyword_match.match_percent !== undefined ? `${result.checks.keyword_match.match_percent}%` : 'N/A'}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ p: 1.5, borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Integrity</Typography>
                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
                                                    {result.checks.file_integrity.passed ? '100% Clean' : 'Corrupt Text'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </GlassCard>

                            {/* Dual Visual Analytics Section: 5-Pillar ATS Balance Radar + Pillar Performance Ratings */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr' }, gap: 3, mb: 4 }}>
                                {/* 1. Pure SVG 5-Pillar ATS Balance Radar */}
                                <GlassCard sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AssessmentOutlinedIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.9)' }} />
                                                <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#fff' }}>
                                                    5-Pillar ATS Balance Radar
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label="Spoke Hover"
                                                size="small"
                                                sx={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', fontSize: '0.68rem', fontWeight: 700, height: 20 }}
                                            />
                                        </Box>
                                        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', mb: 2 }}>
                                            Multi-axis parser balance mapping format safety, structure completeness, timeline flow, keywords, and encoding.
                                        </Typography>
                                    </Box>

                                    <ATSBalanceRadar data={pillarData} overallScore={result.ats_score} />
                                </GlassCard>

                                {/* 2. Pure SVG Pillar Performance Rating Bars */}
                                <GlassCard sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <AssessmentOutlinedIcon sx={{ fontSize: 20, color: 'rgba(255,255,255,0.9)' }} />
                                                <Typography sx={{ fontWeight: 800, fontSize: '0.98rem', color: '#fff' }}>
                                                    Pillar Performance Ratings
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label="70% Threshold"
                                                size="small"
                                                sx={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', fontSize: '0.68rem', fontWeight: 700, height: 20 }}
                                            />
                                        </Box>
                                        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', mb: 2 }}>
                                            Individual ATS pillar performance ratings benchmarked against top Applicant Tracking Systems.
                                        </Typography>
                                    </Box>

                                    <ATSPillarPerformance data={pillarData} />
                                </GlassCard>
                            </Box>

                            {/* Detailed 5-Pillar Diagnostics */}
                            <Box sx={{ mb: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                                        Pillar-by-Pillar Diagnostics & Findings
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>
                                        Click any pillar below to inspect detailed suggestions and detected tokens
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {CHECK_META.map((meta) => {
                                        const check = result.checks[meta.key];
                                        if (!check) return null;

                                        const passed = check.passed;
                                        const statusLabel = passed === true ? 'PASSED' : passed === false ? 'ACTION REQUIRED' : 'N/A';

                                        return (
                                            <Accordion
                                                key={meta.key}
                                                defaultExpanded={!passed}
                                                sx={{
                                                    background: 'rgba(255,255,255,0.02)',
                                                    border: '1px solid rgba(255,255,255,0.07)',
                                                    borderRadius: '16px !important',
                                                    '&:before': { display: 'none' },
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <AccordionSummary
                                                    expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />}
                                                    sx={{ px: 3, py: 1.5, '&:hover': { background: 'rgba(255,255,255,0.015)' } }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2, flexWrap: 'wrap', gap: 1 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Typography sx={{ fontSize: '1.3rem' }}>{meta.icon}</Typography>
                                                            <Box>
                                                                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                                                                    {meta.label}
                                                                </Typography>
                                                                <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)' }}>
                                                                    {meta.desc}
                                                                </Typography>
                                                            </Box>
                                                        </Box>

                                                        <Chip
                                                            label={statusLabel}
                                                            size="small"
                                                            sx={{
                                                                background: passed ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                                                                color: passed ? '#ffffff' : 'rgba(255,255,255,0.65)',
                                                                border: '1px solid rgba(255,255,255,0.15)',
                                                                fontWeight: 800,
                                                                fontSize: '0.68rem',
                                                                height: 22,
                                                            }}
                                                        />
                                                    </Box>
                                                </AccordionSummary>

                                                <AccordionDetails sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                                    {/* Specific pillar diagnostics */}
                                                    {meta.key === 'section_presence' && check.missing_sections && check.missing_sections.length > 0 && (
                                                        <Box sx={{ mb: 2, p: 2, borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', fontWeight: 700, mb: 0.8 }}>
                                                                Missing Recommended Section Headers:
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                                                {check.missing_sections.map(s => (
                                                                    <Chip key={s} label={s} size="small" sx={{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.72rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)' }} />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    )}

                                                    {meta.key === 'formatting_risk' && check.flags && check.flags.length > 0 && (
                                                        <Box sx={{ mb: 2, p: 2, borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', fontWeight: 700, mb: 0.8 }}>
                                                                Formatting Flags:
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                                                {check.flags.map(f => (
                                                                    <Chip key={f} label={f} size="small" sx={{ background: 'rgba(255,255,255,0.06)', color: '#fff', fontSize: '0.72rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.12)' }} />
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    )}

                                                    {meta.key === 'keyword_match' && (
                                                        <Box sx={{ mb: 2 }}>
                                                            {check.matched_keywords && check.matched_keywords.length > 0 && (
                                                                <Box sx={{ mb: 1.5 }}>
                                                                    <Typography sx={{ fontSize: '0.75rem', color: '#ffffff', fontWeight: 700, mb: 0.6 }}>
                                                                        Matched Role Keywords ({check.matched_keywords.length}):
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                                                                        {check.matched_keywords.map(k => (
                                                                            <Chip key={k} label={k} size="small" sx={{ background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.7rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.18)' }} />
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                            {check.missing_keywords && check.missing_keywords.length > 0 && (
                                                                <Box>
                                                                    <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontWeight: 700, mb: 0.6 }}>
                                                                        Target Role Keywords Missing in Resume ({check.missing_keywords.length}):
                                                                    </Typography>
                                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                                                                        {check.missing_keywords.map(k => (
                                                                            <Chip key={k} label={`+ ${k}`} size="small" sx={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', fontWeight: 600, border: '1px solid rgba(255,255,255,0.08)' }} />
                                                                        ))}
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    )}

                                                    {/* Pillar Suggestions */}
                                                    {check.suggestions && check.suggestions.length > 0 ? (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                            {check.suggestions.map((sug, i) => (
                                                                <Box
                                                                    key={i}
                                                                    sx={{
                                                                        display: 'flex',
                                                                        alignItems: 'flex-start',
                                                                        gap: 1.5,
                                                                        p: 1.5,
                                                                        borderRadius: '10px',
                                                                        background: 'rgba(255,255,255,0.02)',
                                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                                    }}
                                                                >
                                                                    <LightbulbOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', mt: 0.2, flexShrink: 0 }} />
                                                                    <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', flex: 1, lineHeight: 1.5 }}>
                                                                        {sug}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        <Typography sx={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 600 }}>
                                                            ✓ No parsing issues detected for this pillar.
                                                        </Typography>
                                                    )}
                                                </AccordionDetails>
                                            </Accordion>
                                        );
                                    })}
                                </Box>
                            </Box>

                            {/* Actionable Optimization Checklist */}
                            {result.all_suggestions && result.all_suggestions.length > 0 && (
                                <GlassCard sx={{ p: { xs: 2.5, md: 3.5 }, mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <LightbulbOutlinedIcon sx={{ fontSize: 22, color: '#ffffff' }} />
                                            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>
                                                Actionable Optimization Checklist ({result.all_suggestions.length} Action Items)
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Chip
                                                label="All"
                                                size="small"
                                                onClick={() => setActiveTab('all')}
                                                sx={{
                                                    cursor: 'pointer',
                                                    background: activeTab === 'all' ? '#fff' : 'rgba(255,255,255,0.05)',
                                                    color: activeTab === 'all' ? '#000' : 'rgba(255,255,255,0.6)',
                                                    fontWeight: 700,
                                                    fontSize: '0.72rem',
                                                }}
                                            />
                                            <Chip
                                                label="Critical Fixes"
                                                size="small"
                                                onClick={() => setActiveTab('critical')}
                                                sx={{
                                                    cursor: 'pointer',
                                                    background: activeTab === 'critical' ? '#fff' : 'rgba(255,255,255,0.05)',
                                                    color: activeTab === 'critical' ? '#000' : 'rgba(255,255,255,0.6)',
                                                    fontWeight: 700,
                                                    fontSize: '0.72rem',
                                                }}
                                            />
                                            <Chip
                                                label="Recommendations"
                                                size="small"
                                                onClick={() => setActiveTab('recommended')}
                                                sx={{
                                                    cursor: 'pointer',
                                                    background: activeTab === 'recommended' ? '#fff' : 'rgba(255,255,255,0.05)',
                                                    color: activeTab === 'recommended' ? '#000' : 'rgba(255,255,255,0.6)',
                                                    fontWeight: 700,
                                                    fontSize: '0.72rem',
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        {result.all_suggestions
                                            .filter(s => {
                                                const isCritical = s.toLowerCase().includes('critical') || s.toLowerCase().includes('missing') || s.toLowerCase().includes('risk');
                                                if (activeTab === 'critical') return isCritical;
                                                if (activeTab === 'recommended') return !isCritical;
                                                return true;
                                            })
                                            .map((suggestion, idx) => {
                                                const isCritical = suggestion.toLowerCase().includes('critical') || suggestion.toLowerCase().includes('missing') || suggestion.toLowerCase().includes('risk');
                                                const isCopied = copiedIndex === idx;

                                                return (
                                                    <Box
                                                        key={idx}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            p: 2,
                                                            borderRadius: '12px',
                                                            background: isCritical ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                                                            border: `1px solid ${isCritical ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                                                            gap: 2,
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                                            <Chip
                                                                label={isCritical ? 'CRITICAL' : 'RECOMMENDED'}
                                                                size="small"
                                                                sx={{
                                                                    background: isCritical ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                                                                    color: isCritical ? '#ffffff' : 'rgba(255,255,255,0.7)',
                                                                    border: '1px solid rgba(255,255,255,0.15)',
                                                                    fontWeight: 800,
                                                                    fontSize: '0.62rem',
                                                                    height: 20,
                                                                    flexShrink: 0,
                                                                }}
                                                            />
                                                            <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                                                                {suggestion}
                                                            </Typography>
                                                        </Box>

                                                        <Tooltip title={isCopied ? 'Copied!' : 'Copy Suggestion'}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleCopy(suggestion, idx)}
                                                                sx={{ color: isCopied ? '#ffffff' : 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff' } }}
                                                            >
                                                                {isCopied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                );
                                            })}
                                    </Box>
                                </GlassCard>
                            )}

                            {/* Bottom Navigation CTA */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/dashboard')}
                                    sx={{
                                        borderColor: 'rgba(255,255,255,0.15)',
                                        color: '#fff',
                                        borderRadius: '12px',
                                        px: 3,
                                        py: 1.2,
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        '&:hover': { borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)' }
                                    }}
                                >
                                    Return to Dashboard
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/career-path')}
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        background: '#fff',
                                        color: '#0a0a0a',
                                        borderRadius: '12px',
                                        px: 3.5,
                                        py: 1.2,
                                        textTransform: 'none',
                                        fontWeight: 800,
                                        boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
                                        '&:hover': { background: '#e5e5e5' }
                                    }}
                                >
                                    Explore Career Pathways
                                </Button>
                            </Box>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Box>
        </Box>
    );
}
