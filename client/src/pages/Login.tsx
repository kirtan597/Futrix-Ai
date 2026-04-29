import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { GoogleLogin } from '@react-oauth/google';
import FutrixLogo from '../components/FutrixLogo';
import SpiralAnimation from '../components/SpiralAnimation';
import { useAuth } from '../store/useAuth';
import apiService from '../services/apiService';

const FEATURES = [
    { label: 'AI Skill Extraction',  desc: 'Detects 40+ technologies from your resume' },
    { label: 'Gap Analysis Engine',  desc: 'Identifies missing in-demand skills' },
    { label: 'Readiness Score',      desc: 'Quantified career readiness out of 100' },
    { label: 'Personalized Roadmap', desc: 'Step-by-step action plan tailored to you' },
];

export default function Login() {
    const [email, setEmail]     = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, []);

    const { setAuth } = useAuth();

    const storeAuthData = (data: any) => {
        setAuth(data.accessToken, data.refreshToken, data.user);
        navigate('/dashboard', { replace: true });
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        setLoading(true);
        setError('');
        try {
            const data = await apiService.publicRequest('/api/auth/google', {
                method: 'POST',
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });
            storeAuthData(data);
        } catch (err: any) {
            setError(err.message || 'Google login failed');
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const data = await apiService.publicRequest('/api/login', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
            storeAuthData(data);
        } catch (err: any) {
            setError(err.message || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            background: '#0a0a0a',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Spiral background */}
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <SpiralAnimation />
            </Box>
            <Box sx={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.7) 100%)',
                pointerEvents: 'none',
            }} />

            {/* Left panel */}
            <Box sx={{
                display: { xs: 'none', md: 'flex' },
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'center',
                px: { md: 8, lg: 12 },
                position: 'relative',
                zIndex: 1,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 8 }}>
                    <FutrixLogo size={44} glow />
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.035em', lineHeight: 1 }}>
                            Futrix AI
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.04em', mt: 0.2 }}>
                            Powered by NLP · FastAPI
                        </Typography>
                    </Box>
                </Box>

                <Typography sx={{
                    fontSize: { md: '2.8rem', lg: '3.6rem' },
                    fontWeight: 900,
                    color: '#fff',
                    letterSpacing: '-0.05em',
                    lineHeight: 1.05,
                    mb: 2.5,
                }}>
                    Analyze your<br />
                    <Box component="span" sx={{ color: 'rgba(255,255,255,0.35)' }}>
                        career potential
                    </Box>
                </Typography>

                <Typography sx={{
                    color: 'rgba(255,255,255,0.38)',
                    fontSize: '1rem',
                    lineHeight: 1.8,
                    mb: 7,
                    maxWidth: 400,
                }}>
                    AI-powered resume analysis, skills gap detection, and personalized career roadmaps — all in seconds.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {FEATURES.map((f, i) => (
                        <Box key={f.label} sx={{
                            display: 'flex', alignItems: 'flex-start', gap: 1.8,
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                            transition: `opacity 0.5s ease ${0.15 + i * 0.08}s, transform 0.5s ease ${0.15 + i * 0.08}s`,
                        }}>
                            <Box sx={{
                                width: 22, height: 22, borderRadius: '6px',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, mt: 0.2,
                            }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', lineHeight: 1.3 }}>
                                    {f.label}
                                </Typography>
                                <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)', lineHeight: 1.5, mt: 0.2 }}>
                                    {f.desc}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Right panel — login form */}
            <Box sx={{
                width: { xs: '100%', md: '460px' },
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 3, sm: 5, md: 6 },
                py: 4,
                position: 'relative',
                zIndex: 1,
                borderLeft: { md: '1px solid rgba(255,255,255,0.05)' },
                background: { md: 'rgba(255,255,255,0.015)' },
                backdropFilter: { md: 'blur(24px)' },
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(20px)',
                transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
            }}>
                <Box sx={{ width: '100%', maxWidth: 380 }}>
                    {/* Mobile logo */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 6, justifyContent: 'center' }}>
                        <FutrixLogo size={38} />
                        <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>Futrix AI</Typography>
                    </Box>

                    <Typography sx={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', mb: 0.6 }}>
                        Get started
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.88rem', mb: 5, lineHeight: 1.6 }}>
                        Sign in to analyze your resume with AI.
                    </Typography>

                    {/* Form card */}
                    <Box sx={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '18px',
                        p: { xs: 3, sm: 3.5 },
                        backdropFilter: 'blur(12px)',
                    }}>
                        {/* Top accent line */}
                        <Box sx={{
                            height: 1,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                            borderRadius: '18px 18px 0 0',
                            mx: -3.5, mt: -3.5, mb: 3.5,
                        }} />

                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google login failed. Please try again.')}
                                theme="filled_black"
                                shape="pill"
                                size="large"
                                text="continue_with"
                                useOneTap={false}
                                auto_select={false}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                            <Box sx={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                or
                            </Typography>
                            <Box sx={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                        </Box>

                        <Box component="form" onSubmit={handleEmailLogin} noValidate>
                            <TextField
                                label="Email Address"
                                type="email"
                                fullWidth
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                sx={{ mb: 2.5 }}
                            />

                            {error && (
                                <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading || !email}
                            >
                                {loading
                                    ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CircularProgress size={16} sx={{ color: 'rgba(0,0,0,0.5)' }} />
                                        Signing in...
                                      </Box>
                                    : 'Start Analysis →'
                                }
                            </Button>
                        </Box>
                    </Box>

                    <Typography sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.16)', fontSize: '0.75rem', mt: 3 }}>
                        No password required · Secure JWT auth
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
