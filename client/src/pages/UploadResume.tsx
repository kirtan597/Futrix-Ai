import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useDropzone } from 'react-dropzone';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';

import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import EastIcon from '@mui/icons-material/East';
import RefreshIcon from '@mui/icons-material/Refresh';
import { extractResumeText, validateResumeText } from '../services/resumeParser';

const STEPS = [
    { num: '01', text: 'AI scans your exact text for known technologies' },
    { num: '02', text: 'Gaps are identified based on your detected stack' },
    { num: '03', text: 'A readiness score (0–100) is calculated from your text' },
    { num: '04', text: 'A roadmap is built from your identified gaps only' },
];

const TIPS = [
    'Include all technologies, tools, and languages you have used',
    'Mention past job titles, projects, and responsibilities',
    'Add frameworks, libraries, and development methodologies',
    'Include cloud providers and DevOps tools (AWS, Docker, CI/CD)',
];

// ─── Glass card ───────────────────────────────────────────────────────────────
function Panel({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box sx={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.065)',
            borderRadius: '18px',
            backdropFilter: 'blur(12px)',
            ...sx,
        }}>
            {children}
        </Box>
    );
}

const ANALYZING_STEPS = [
    'Validating resume content...',
    'Scanning for technical skills...',
    'Analyzing stack & detecting skill gaps...',
    'Computing career readiness score...',
    'Generating personalized roadmap...',
    'Saving analysis results...',
];

// ─── Analysis loading overlay ─────────────────────────────────────────────────
function AnalyzingOverlay({ visible }: { visible: boolean }) {
    const [step, setStep] = React.useState(0);
    const [elapsed, setElapsed] = React.useState(0);

    React.useEffect(() => {
        if (!visible) { setStep(0); setElapsed(0); return; }
        const stepTimer = setInterval(() => setStep(prev => Math.min(prev + 1, ANALYZING_STEPS.length - 1)), 2500);
        const secTimer  = setInterval(() => setElapsed(prev => prev + 1), 1000);
        return () => { clearInterval(stepTimer); clearInterval(secTimer); };
    }, [visible]);

    if (!visible) return null;

    const isSlow = elapsed > 15;
    const messageOverride = isSlow ? 'Cold start: AI engine is spinning up, please wait...' : undefined;

    return (
        <Box sx={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(10,10,10,0.95)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 3,
            px: { xs: 2, md: 4 },
        }}>
            <Box sx={{
                width: 64, height: 64, borderRadius: '18px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'float 2s ease-in-out infinite',
            }}>
                <AutoAwesomeOutlinedIcon sx={{ fontSize: 28, color: 'rgba(255,255,255,0.7)' }} />
            </Box>
            <Box sx={{ textAlign: 'center', px: 3, maxWidth: 400 }}>
                <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: 'clamp(1rem, 3vw, 1.1rem)', letterSpacing: '-0.02em', mb: 1 }}>
                    Analyzing with AI
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(0.85rem, 2.5vw, 0.9rem)', mb: 0.5, fontWeight: 500 }}>
                    {messageOverride || ANALYZING_STEPS[step]}
                </Typography>
                
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', mb: 2 }}>
                    {elapsed}s elapsed{isSlow ? ' — still processing' : ''}
                </Typography>
                <Box sx={{ width: '100%', mx: 'auto' }}>
                    <LinearProgress
                        variant="indeterminate"
                        sx={{
                            height: 3, borderRadius: 99,
                            background: 'rgba(255,255,255,0.05)',
                            '& .MuiLinearProgress-bar': { background: 'rgba(255,255,255,0.6)' },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}

export default function UploadResume() {
    const [resumeText, setResumeText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const getErrorMessage = (err: unknown, fallback: string) =>
        err instanceof Error ? err.message : fallback;

    // ── Dropzone ──
    const onDrop = useCallback(async (acceptedFiles: File[], fileRejections: any[]) => {
        if (fileRejections && fileRejections.length > 0) {
            setError('Please upload a plain text (.txt) file under 5MB.');
            return;
        }

        const file = acceptedFiles[0];
        if (!file) return;

        setError('');
        try {
            const text = await extractResumeText(file);
            setResumeText(text);
        } catch (err: unknown) {
            setError(getErrorMessage(err, 'Failed to read file'));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        maxSize: 5 * 1024 * 1024,
        accept: { 'text/plain': ['.txt'] },
    });

    const handleUpload = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        const validation = validateResumeText(resumeText);
        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const data = await apiService.post('/api/upload-resume', { text: resumeText.trim() });
            localStorage.setItem('analysisResult', JSON.stringify(data));
            navigate('/dashboard');
        } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error('[UploadResume] ❌ Error:', errorMsg);
            
            let displayError = errorMsg;
            if (errorMsg.includes('429') || errorMsg.includes('Rate limit') || errorMsg.includes('analyses per hour')) {
                displayError = '⏳ Too many requests. Please wait a few seconds and click Retry.';
            } else if (errorMsg.includes('503') || errorMsg.includes('Service') || errorMsg.includes('unavailable') || errorMsg.includes('offline')) {
                displayError = '🔄 The AI engine is temporarily busy or spinning up. Please click Retry below in a moment.';
            } else if (errorMsg.includes('timeout') || errorMsg.includes('504')) {
                displayError = '⏱️ The analysis request timed out. Please click Retry to try again.';
            } else if (errorMsg.includes('401') || errorMsg.includes('Session') || errorMsg.includes('Token')) {
                displayError = '🔐 Your session has expired. Please log in again.';
            }
            
            setError(displayError);
        } finally {
            setLoading(false);
        }
    };

    const charCount = resumeText.trim().length;
    const isReady = charCount >= 50 && charCount <= 50000;

    return (
        <>
            <AnalyzingOverlay visible={loading} />
            <Box sx={{
                minHeight: '100%',
                background: '#0a0a0a',
                py: { xs: 2, sm: 3, md: 5 },
                px: { xs: 1.5, sm: 2, md: 5 },
                width: '100%',
                boxSizing: 'border-box',
            }}>
                {/* ── Header ── */}
                <Box sx={{ mb: 5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        <Box sx={{
                            width: 36, height: 36, borderRadius: '10px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ArticleOutlinedIcon sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 18 }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.2 }}>
                                Resume Analysis
                            </Typography>
                            <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                                Upload Resume
                            </Typography>
                        </Box>
                    </Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', lineHeight: 1.7, ml: { xs: 0, sm: '52px' }, maxWidth: 500, mb: 2 }}>
                        Our AI engine extracts skills strictly from your pasted text — no assumptions, no hallucinations. Only what you write is analyzed.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: { xs: 0, sm: '52px' } }}>
                        {['Text-Only Detection', 'Gap Analysis', 'Score 0–100', 'Roadmap'].map((f) => (
                            <Chip
                                key={f}
                                label={f}
                                size="small"
                                icon={<CheckCircleOutlineIcon sx={{ fontSize: '12px !important', color: 'rgba(255,255,255,0.3) !important' }} />}
                                sx={{
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    color: 'rgba(255,255,255,0.4)',
                                    fontWeight: 600, fontSize: '0.73rem',
                                }}
                            />
                        ))}
                    </Box>
                </Box>

                {/* ── Main grid with mobile-first order ── */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 288px' }, gap: { xs: 2, md: 2.5 } }}>

                    {/* ── Upload card (order 1 on mobile) ── */}
                    <Panel sx={{ order: { xs: 1, md: 'unset' } }}>
                        {/* Dropzone header */}
                        <Box
                            {...getRootProps()}
                            sx={{
                                p: { xs: 2, sm: 3 },
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '18px 18px 0 0',
                                transition: 'background 0.2s',
                                ...(isDragActive ? { background: 'rgba(255,255,255,0.05)' } : {}),
                            }}
                        >
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <Box sx={{ textAlign: 'center', py: 3 }}>
                                    <CloudUploadOutlinedIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.5)', mb: 1 }} />
                                    <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Drop your .txt file here</Typography>
                                </Box>
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                                        Resume Text
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".txt,text/plain"
                                            style={{ display: 'none' }}
                                            onChange={async (ev) => {
                                                const f = ev.target.files?.[0];
                                                if (!f) return;
                                                setError('');
                                                try {
                                                    const text = await extractResumeText(f);
                                                    setResumeText(text);
                                                } catch (err: unknown) {
                                                    setError(getErrorMessage(err, 'Failed to read file'));
                                                } finally {
                                                    ev.currentTarget.value = '';
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => fileInputRef.current?.click()}
                                            startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                                            sx={{ fontSize: '0.78rem', borderRadius: '8px', px: 1.5, minHeight: 38 }}
                                        >
                                            Upload File
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => { setResumeText(''); setError(''); }}
                                            sx={{ fontSize: '0.78rem', borderRadius: '8px', px: 1.5, minHeight: 38 }}
                                            disabled={!resumeText}
                                        >
                                            Clear
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Textarea + submit */}
                        <Box component="form" onSubmit={handleUpload} sx={{ p: { xs: 2, sm: 3 } }}>
                            <TextField
                                multiline
                                minRows={10}
                                maxRows={20}
                                fullWidth
                                placeholder={`Paste your resume text here...\n\ne.g.,  Skills: React, TypeScript, Python, Docker, AWS\nExperience: Software Engineer at Tech Corp (2021-Present)\n- Built scalable REST APIs using Node.js and PostgreSQL\n- Designed cloud infrastructure with Docker and Kubernetes`}
                                value={resumeText}
                                onChange={(e) => {
                                    setResumeText(e.target.value);
                                    if (error && e.target.value.trim().length >= 50) setError('');
                                }}
                                required
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                        fontSize: 'clamp(0.8rem, 2vw, 0.845rem)',
                                        lineHeight: 1.75,
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        '@media (max-width:600px)': {
                                            fontSize: '16px !important',
                                            minHeight: '140px',
                                            maxHeight: '320px',
                                        },
                                        '@media (min-width:601px) and (max-width:960px)': {
                                            minHeight: '180px',
                                            maxHeight: '450px',
                                        },
                                    },
                                }}
                            />

                            {/* Char count & minimum validation status */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                                <Typography sx={{ 
                                    fontSize: '0.75rem', 
                                    color: charCount < 50 ? 'rgba(248,113,113,0.8)' : 'rgba(134,239,172,0.8)',
                                    fontWeight: 600
                                }}>
                                    {charCount === 0 
                                        ? 'Minimum 50 characters required' 
                                        : charCount < 50 
                                            ? `Need ${50 - charCount} more character${50 - charCount > 1 ? 's' : ''} (minimum 50 required)`
                                            : '✓ Ready for analysis'}
                                </Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: isReady ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)' }}>
                                    {charCount} / 50,000 chars
                                </Typography>
                            </Box>

                            {error && (
                                <Alert 
                                    severity="error" 
                                    sx={{ mb: 2.5 }}
                                    action={
                                        isReady ? (
                                            <Button 
                                                color="inherit" 
                                                size="small" 
                                                startIcon={<RefreshIcon />}
                                                onClick={() => handleUpload()}
                                                sx={{ textTransform: 'none', fontWeight: 700 }}
                                            >
                                                Retry
                                            </Button>
                                        ) : undefined
                                    }
                                >
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading || !isReady}
                                endIcon={<EastIcon />}
                                sx={{
                                    py: 1.5,
                                    minHeight: 48,
                                    fontSize: '0.92rem',
                                    fontWeight: 700,
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    background: isReady ? '#fff' : 'rgba(255,255,255,0.1)',
                                    color: isReady ? '#000' : 'rgba(255,255,255,0.3)',
                                    '&:hover': {
                                        background: isReady ? '#e5e5e5' : 'rgba(255,255,255,0.1)',
                                    },
                                }}
                            >
                                {loading ? 'Analyzing Resume...' : 'Analyze Resume'}
                            </Button>
                        </Box>
                    </Panel>

                    {/* ── Sidebar cards (order 2 on mobile) ── */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, order: { xs: 2, md: 'unset' } }}>
                        {/* How it works */}
                        <Panel sx={{ p: { xs: 2.5, sm: 3 } }}>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2 }}>
                                How It Works
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {STEPS.map((s) => (
                                    <Box key={s.num} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace', mt: 0.2 }}>
                                            {s.num}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                                            {s.text}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Panel>

                        {/* Tips */}
                        <Panel sx={{ p: { xs: 2.5, sm: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.4)' }} />
                                <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                    Tips for Best Results
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                                {TIPS.map((t) => (
                                    <Box key={t} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', mt: 0.8, flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
                                            {t}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Panel>
                    </Box>
                </Box>
            </Box>
        </>
    );
}
