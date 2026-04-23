import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { GoogleLogin } from '@react-oauth/google';
import FutrixLogo from '../components/FutrixLogo';
import SpiralAnimation from '../components/SpiralAnimation';

// ─── Feature list ─────────────────────────────────────────────────────────────
const FEATURES = [
    { label: 'AI Skill Extraction',      desc: 'Detects 40+ technologies from your resume' },
    { label: 'Gap Analysis Engine',      desc: 'Identifies missing in-demand skills' },
    { label: 'Readiness Score',          desc: 'Quantified career readiness out of 100' },
    { label: 'Personalized Roadmap',     desc: 'Step-by-step action plan tailored to you' },
];


export default function Login() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.clear();
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, []);

    const handleGoogleSuccess = async (credentialResponse: any) => {
        console.log('=== GOOGLE OAUTH DEBUG START ===');
        console.log('1. Credential Response:', credentialResponse);
        
        setLoading(true);
        setError('');
        setDebugInfo('Received Google credential...');
        
        if (!credentialResponse?.credential) {
            console.error('No credential in response');
            setError('No credential received from Google. Please try again.');
            setDebugInfo('Error: No credential');
            setLoading(false);
            return;
        }
        
        try {
            console.log('2. Sending to backend: /api/auth/google');
            setDebugInfo('Sending to backend...');
            
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ credential: credentialResponse.credential }),
            });
            
            console.log('3. Backend response status:', response.status);
            console.log('4. Response headers:', Object.fromEntries(response.headers.entries()));
            
            const data = await response.json();
            console.log('5. Backend response data:', data);
            
            if (!response.ok) {
                console.error('Backend returned error:', data);
                setError(`Backend error: ${data.error || data.message || 'Unknown error'}`);
                setDebugInfo(`Error ${response.status}: ${data.error || data.message}`);
                setLoading(false);
                return;
            }
            
            if (data.status === 'logged_in' && data.accessToken && data.refreshToken) {
                console.log('6. Login successful, storing tokens...');
                setDebugInfo('Login successful! Redirecting...');
                
                // Store tokens
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('userEmail', data.user.email);
                if (data.user.name) localStorage.setItem('userName', data.user.name);
                if (data.user.avatar) localStorage.setItem('userAvatar', data.user.avatar);
                
                console.log('7. Tokens stored, navigating to dashboard...');
                console.log('=== GOOGLE OAUTH DEBUG END ===');
                
                // Small delay to ensure storage completes
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 100);
            } else {
                console.error('Invalid response structure:', data);
                setError('Invalid response from server. Missing tokens or status.');
                setDebugInfo('Error: Invalid server response');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('8. Network/Parse error:', err);
            setError(`Connection error: ${err.message}. Is the backend running on port 5000?`);
            setDebugInfo(`Network error: ${err.message}`);
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok && data.status === 'logged_in') {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('userEmail', data.user.email);
                if (data.user.name) localStorage.setItem('userName', data.user.name);
                if (data.user.avatar) localStorage.setItem('userAvatar', data.user.avatar);
                navigate('/dashboard');
            } else {
                setError(data.message || data.error || 'Login failed. Please try again.');
            }
        } catch {
            setError('Cannot connect to server. Make sure Node.js API is running on port 5000.');
        } finally {
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
            {/* ── Spiral Animation Background ── */}
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <SpiralAnimation />
            </Box>
            {/* Dim overlay so text is readable over the animation */}
            <Box sx={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.7) 100%)',
                pointerEvents: 'none',
            }} />

            {/* ── Left Panel ── */}
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
                {/* Logo */}
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

                {/* Headline */}
                <Typography sx={{
                    fontSize: { md: '2.8rem', lg: '3.6rem' },
                    fontWeight: 900,
                    color: '#ffffff',
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

                {/* Feature list */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {FEATURES.map((f, i) => (
                        <Box
                            key={f.label}
                            sx={{
                                display: 'flex', alignItems: 'flex-start', gap: 1.8,
                                opacity: mounted ? 1 : 0,
                                transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                                transition: `opacity 0.5s ease ${0.15 + i * 0.08}s, transform 0.5s ease ${0.15 + i * 0.08}s`,
                            }}
                        >
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

            {/* ── Right Panel — Login Form ── */}
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

                    {/* Form heading */}
                    <Typography sx={{ fontSize: '1.65rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', mb: 0.6 }}>
                        Get started
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.88rem', mb: 5, lineHeight: 1.6 }}>
                        Enter your email to analyze your resume with AI.
                    </Typography>

                    {/* Form Card */}
                    <Box sx={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '18px',
                        p: { xs: 3, sm: 3.5 },
                        backdropFilter: 'blur(12px)',
                    }}>
                        {/* Top accent */}
                        <Box sx={{
                            height: 1,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                            borderRadius: '18px 18px 0 0',
                            mx: -3.5, mt: -3.5, mb: 3.5,
                        }} />

                        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => {
                                    console.error('Google OAuth Error');
                                    setError('Google Login Failed. Please try again or use email login.');
                                }}
                                theme="filled_black"
                                shape="pill"
                                width="100%"
                                size="large"
                                text="continue_with"
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3.5, gap: 2 }}>
                            <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                OR
                            </Typography>
                            <Box sx={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                        </Box>

                        <Box component="form" onSubmit={handleLogin} noValidate>
                            <TextField
                                label="Email Address"
                                type="email"
                                fullWidth
                                required
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                sx={{ mb: 2.5 }}
                                inputProps={{ id: 'login-email' }}
                            />

                            {error && (
                                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.82rem' }}>
                                    {error}
                                </Alert>
                            )}

                            {debugInfo && (
                                <Alert severity="info" sx={{ mb: 2.5, borderRadius: '10px', fontSize: '0.82rem' }}>
                                    Debug: {debugInfo}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={loading || !email}
                                sx={{
                                    py: 1.5,
                                    fontSize: '0.9rem',
                                    borderRadius: '12px',
                                    background: '#ffffff',
                                    color: '#0a0a0a',
                                    fontWeight: 700,
                                    letterSpacing: '-0.01em',
                                    '&:hover': {
                                        background: '#e5e5e5',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 8px 28px rgba(255,255,255,0.12)',
                                    },
                                    '&.Mui-disabled': {
                                        background: 'rgba(255,255,255,0.08)',
                                        color: 'rgba(255,255,255,0.25)',
                                    },
                                    transition: 'all 0.2s',
                                }}
                            >
                                {loading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CircularProgress size={16} sx={{ color: 'rgba(0,0,0,0.5)' }} />
                                        Signing in...
                                    </Box>
                                ) : 'Start Analysis →'}
                            </Button>
                        </Box>

                        {/* Trust badges */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3.5, mt: 3.5, pt: 3, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            {[
                                { icon: <ShieldOutlinedIcon sx={{ fontSize: 13 }} />, text: 'Secure' },
                                { icon: <BoltOutlinedIcon sx={{ fontSize: 13 }} />, text: 'Instant AI' },
                                { icon: <LockOutlinedIcon sx={{ fontSize: 13 }} />, text: 'JWT Auth' },
                            ].map(({ icon, text }) => (
                                <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                    <Box sx={{ color: 'rgba(255,255,255,0.25)' }}>{icon}</Box>
                                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
                                        {text}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    <Typography sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.16)', fontSize: '0.75rem', mt: 3 }}>
                        No password required · Email-based magic link
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
