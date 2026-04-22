import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';

import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined';
import EastIcon from '@mui/icons-material/East';

const SAMPLE_RESUME = `Software Engineer with 3 years of experience.

Skills: React, TypeScript, Node.js, Python, MongoDB, Docker, Git, REST API

Experience:
- Built full-stack web applications using React and Node.js
- Deployed services using Docker and AWS
- Worked in Agile/Scrum teams`;

const STEPS = [
    { num: '01', text: 'AI scans your exact text for known technologies' },
    { num: '02', text: 'Gaps are identified based on your detected stack' },
    { num: '03', text: 'A readiness score (0–100) is calculated from your text' },
    { num: '04', text: 'A roadmap is built from your identified gaps only' },
];

const TIPS = [
    'Include all technologies you have used',
    'Mention job titles and project names',
    'Add tools, frameworks, and methodologies',
    'Include cloud services (AWS, Azure, GCP)',
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

// ─── Analysis loading overlay ─────────────────────────────────────────────────
function AnalyzingOverlay({ visible }: { visible: boolean }) {
    if (!visible) return null;
    const steps = ['Parsing resume...', 'Extracting skills...', 'Detecting gaps...', 'Scoring readiness...', 'Building roadmap...'];
    const [step, setStep] = React.useState(0);
    React.useEffect(() => {
        if (!visible) return;
        const t = setInterval(() => setStep(prev => Math.min(prev + 1, steps.length - 1)), 900);
        return () => clearInterval(t);
    }, [visible]);

    return (
        <Box sx={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(10,10,10,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column',
            gap: 3,
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
            <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem', letterSpacing: '-0.02em', mb: 1 }}>
                    Analyzing with AI
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', mb: 3 }}>
                    {steps[step]}
                </Typography>
                <Box sx={{ width: 220, mx: 'auto' }}>
                    <LinearProgress
                        variant="determinate"
                        value={((step + 1) / steps.length) * 100}
                        sx={{
                            height: 2,
                            borderRadius: 99,
                            background: 'rgba(255,255,255,0.05)',
                            '& .MuiLinearProgress-bar': { background: 'rgba(255,255,255,0.5)' },
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

    // ── Dropzone ──
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => setResumeText((e.target?.result as string) || '');
            reader.readAsText(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        accept: { 'text/plain': ['.txt'] },
    });

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const email = localStorage.getItem('userEmail') || '';
        const token = localStorage.getItem('token') || '';
        try {
            const response = await fetch('/api/upload-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ text: resumeText, email }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('analysisResult', JSON.stringify(data));
                navigate('/dashboard');
            } else if (response.status === 401) {
                localStorage.clear();
                navigate('/login');
            } else {
                setError(data.error || 'Analysis failed. Please try again.');
            }
        } catch {
            setError('Cannot connect to Node.js API on port 5000. Is it running?');
        } finally {
            setLoading(false);
        }
    };

    const charCount = resumeText.trim().length;
    const isReady = charCount >= 50;

    return (
        <>
            <AnalyzingOverlay visible={loading} />
            <Box sx={{
                minHeight: '100vh',
                background: '#0a0a0a',
                py: { xs: 3, md: 5 },
                px: { xs: 2, sm: 3, md: 5 },
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
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', lineHeight: 1.7, ml: '52px', maxWidth: 500, mb: 2 }}>
                        Our AI engine extracts skills strictly from your pasted text — no assumptions, no hallucinations. Only what you write is analyzed.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', ml: '52px' }}>
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

                {/* ── Main grid ── */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 288px' }, gap: 2.5 }}>

                    {/* ── Upload card ── */}
                    <Panel>
                        {/* Dropzone header */}
                        <Box
                            {...getRootProps()}
                            sx={{
                                p: 3,
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
                                        Resume Text
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setResumeText(SAMPLE_RESUME)}
                                            startIcon={<AutoAwesomeOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                                            sx={{ fontSize: '0.75rem', borderRadius: '8px', px: 1.5 }}
                                        >
                                            Sample
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => setResumeText('')}
                                            sx={{ fontSize: '0.75rem', borderRadius: '8px', px: 1.5 }}
                                            disabled={!resumeText}
                                        >
                                            Clear
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Textarea + submit */}
                        <Box component="form" onSubmit={handleUpload} sx={{ p: 3 }}>
                            <TextField
                                multiline
                                minRows={13}
                                fullWidth
                                placeholder={`Paste your resume text here...\n\ne.g.,  Skills: React, Python, Docker\nExperience: Software Engineer at...`}
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                required
                                sx={{
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                        fontSize: '0.845rem',
                                        lineHeight: 1.75,
                                    },
                                }}
                            />

                            {/* Char count */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
                                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)' }}>
                                    Drag & drop a .txt file, or paste below
                                </Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: charCount > 50 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)' }}>
                                    {charCount} chars
                                </Typography>
                            </Box>

                            {error && (
                                <Alert severity="error" sx={{ mb: 2.5 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading || !isReady}
                                endIcon={<EastIcon />}
                                sx={{ py: 1.55, fontSize: '0.9rem', borderRadius: '12px', fontWeight: 700 }}
                            >
                                Generate AI Career Report
                            </Button>
                        </Box>
                    </Panel>

                    {/* ── Sidebar ── */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

                        {/* What happens next */}
                        <Panel sx={{ p: 2.5 }}>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 2.5 }}>
                                What happens next
                            </Typography>
                            {STEPS.map(({ num, text }) => (
                                <Box key={num} sx={{ display: 'flex', gap: 1.8, mb: 1.8, alignItems: 'flex-start' }}>
                                    <Typography sx={{
                                        fontWeight: 800, fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)',
                                        minWidth: 26, fontFamily: 'monospace',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '5px',
                                        px: 0.7, py: 0.3, textAlign: 'center',
                                    }}>
                                        {num}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.81rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
                                        {text}
                                    </Typography>
                                </Box>
                            ))}
                        </Panel>

                        {/* Tips */}
                        <Panel sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
                                    Tips for best results
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            {TIPS.map((tip) => (
                                <Box key={tip} sx={{ display: 'flex', gap: 1.2, mb: 1.3, alignItems: 'flex-start' }}>
                                    <Box sx={{
                                        width: 4, height: 4, borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.25)',
                                        flexShrink: 0, mt: '8px',
                                    }} />
                                    <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                                        {tip}
                                    </Typography>
                                </Box>
                            ))}
                        </Panel>

                        {/* Upload indicator */}
                        {charCount > 0 && (
                            <Panel sx={{ p: 2, borderColor: 'rgba(255,255,255,0.1)' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                                    <CircularProgress
                                        variant="determinate"
                                        value={Math.min((charCount / 50) * 100, 100)}
                                        size={26}
                                        thickness={3}
                                        sx={{ color: 'rgba(255,255,255,0.5)' }}
                                    />
                                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
                                        {isReady ? 'Ready to analyze' : `Minimum 50 chars (${50 - charCount} more)`}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min((charCount / 50) * 100, 100)}
                                    sx={{ height: 2, borderRadius: 99 }}
                                />
                            </Panel>
                        )}
                    </Box>
                </Box>
            </Box>
        </>
    );
}
