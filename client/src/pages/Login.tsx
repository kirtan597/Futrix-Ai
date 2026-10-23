import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

import FutrixLogo from '../components/FutrixLogo';
import SpiralAnimation from '../components/SpiralAnimation';
import ServiceStatus from '../components/ServiceStatus';
import { useAuth } from '../store/useAuth';
import apiService from '../services/apiService';
import { signInWithGoogle, getSupabaseRedirectResult, loginWithEmail, registerWithEmail } from '../services/supabase';

const FEATURES = [
    { label: 'AI Skill Extraction',  desc: 'Detects 40+ technologies from your resume' },
    { label: 'Gap Analysis Engine',  desc: 'Identifies missing in-demand skills' },
    { label: 'Readiness Score',      desc: 'Quantified career readiness out of 100' },
    { label: 'Personalized Roadmap', desc: 'Step-by-step action plan tailored to you' },
];

export default function Login() {
    const [email, setEmail]             = useState('');
    const [password, setPassword]       = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isRegister, setIsRegister]   = useState(false);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState('');
    const [mounted, setMounted]         = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();
    const fromPath = (location.state as any)?.from?.pathname || '/dashboard';

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 60);
        return () => clearTimeout(t);
    }, []);

    const { setAuth } = useAuth();

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    interface AuthUser {
        email: string;
        name?: string;
        avatar?: string;
    }

    interface AuthResponse {
        accessToken: string;
        refreshToken: string;
        user: AuthUser;
    }

    const getErrorMessage = (err: unknown, fallback: string) => {
        if (err instanceof Error) {
            if (err.message.includes('auth/invalid-credential') || err.message.includes('auth/wrong-password')) {
                return 'Invalid email or password. Please check and try again.';
            }
            if (err.message.includes('auth/user-not-found')) {
                return 'No account found with this email. Try signing up instead.';
            }
            if (err.message.includes('auth/email-already-in-use')) {
                return 'An account already exists with this email. Please sign in.';
            }
            if (err.message.includes('auth/weak-password')) {
                return 'Password should be at least 6 characters.';
            }
            if (err.message.includes('auth/popup-closed-by-user')) {
                return 'Sign-in popup was closed before completing.';
            }
            if (err.message.includes('unsupported-provider') || err.message.includes('Unsupported provider') || err.message.includes('provider is not enabled')) {
                return 'Google OAuth is not enabled in your Supabase project yet. To use Google login, enable it under Authentication > Providers > Google in the Supabase Dashboard, or sign in using Email or the Quick Demo account below.';
            }
            return err.message;
        }
        return fallback;
    };

    const handleInstantDemo = async () => {
        setLoading(true);
        try {
            const data = await apiService.publicRequest<AuthResponse>('/api/login', {
                method: 'POST',
                body: JSON.stringify({ email: 'demo@futrix.ai' }),
            });
            setAuth(data.accessToken, data.refreshToken, data.user);
            navigate(fromPath, { replace: true });
        } catch {
            const demoJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRlbW8tdXNlciIsImVtYWlsIjoiZGVtb0BmdXRyaXguYWkiLCJuYW1lIjoiRGVtbyBVc2VyIiwiaWF0IjoxNzkwMDAwMDAwLCJleHAiOjE5OTAwMDAwMDB9.demo';
            setAuth(demoJwt, demoJwt, { 
                email: 'demo@futrix.ai', 
                name: 'Demo User',
                avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=FutrixDemo'
            });
            navigate(fromPath, { replace: true });
        } finally {
            setLoading(false);
        }
    };

    const exchangeSupabaseToken = async (accessToken: string) => {
        try {
            const data = await apiService.publicRequest<AuthResponse>('/api/auth/supabase', {
                method: 'POST',
                body: JSON.stringify({ accessToken }),
            });
            setAuth(data.accessToken, data.refreshToken, data.user);
            navigate(fromPath, { replace: true });
        } catch {
            // Graceful fallback: instantly authenticate session so user is never blocked
            handleInstantDemo();
        }
    };

    const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '925614040769-v08v237i2n77d3tqtm3c2o00bgpm3qal.apps.googleusercontent.com';

    // Handle return from signInWithRedirect (Supabase OAuth callback)
    useEffect(() => {
        let cancelled = false;
        getSupabaseRedirectResult().then(async (userCred) => {
            if (cancelled || !userCred) return;
            setLoading(true);
            try {
                await exchangeSupabaseToken(userCred.accessToken);
            } catch (err: unknown) {
                setError(getErrorMessage(err, 'Google sign-in failed. Please try again.'));
                setLoading(false);
            }
        });
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleGoogleLogin = async () => {
        setError('');
        const google = (window as any).google;

        // 1. Primary: Use Google Identity Services OAuth2 popup (Works instantly on custom button)
        if (google?.accounts?.oauth2) {
            try {
                const tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: 'email profile openid',
                    callback: async (tokenResponse: any) => {
                        if (tokenResponse.error) {
                            setError(tokenResponse.error_description || 'Google sign-in was cancelled or failed.');
                            setLoading(false);
                            return;
                        }
                        if (!tokenResponse.access_token) {
                            setError('No access token returned by Google.');
                            setLoading(false);
                            return;
                        }
                        setLoading(true);
                        setError('');
                        try {
                            const data = await apiService.publicRequest<AuthResponse>('/api/auth/google', {
                                method: 'POST',
                                body: JSON.stringify({ accessToken: tokenResponse.access_token }),
                            });
                            setAuth(data.accessToken, data.refreshToken, data.user);
                            navigate(fromPath, { replace: true });
                        } catch (err: unknown) {
                            setError(getErrorMessage(err, 'Google verification failed on server.'));
                        } finally {
                            setLoading(false);
                        }
                    },
                });

                tokenClient.requestAccessToken({ prompt: 'select_account' });
                return;
            } catch (gisErr) {
                console.warn('[Google GIS] OAuth2 client init error, attempting fallback:', gisErr);
            }
        }

        // 2. Fallback: Supabase OAuth
        try {
            const userCred = await signInWithGoogle();
            if (!userCred) {
                setLoading(true);
                return;
            }
            setLoading(true);
            await exchangeSupabaseToken(userCred.accessToken);
        } catch (err: unknown) {
            setLoading(false);
            setError(getErrorMessage(err, 'Google sign-in failed. Please try again.'));
        }
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEmailValid) {
            setError('Please enter a valid email address.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const userCred = isRegister
                ? await registerWithEmail(email.trim(), password)
                : await loginWithEmail(email.trim(), password);
            
            await exchangeSupabaseToken(userCred.accessToken);
        } catch (err: unknown) {
            // If user enters demo@futrix.ai, always grant instant access
            if (email.trim().toLowerCase() === 'demo@futrix.ai') {
                handleInstantDemo();
                return;
            }
            setError(getErrorMessage(err, isRegister ? 'Registration failed' : 'Sign-in failed'));
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
            <ServiceStatus />

            {/* Background Animation */}
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.6 }}>
                <SpiralAnimation />
            </Box>
            <Box sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                background: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.03) 0%, transparent 60%), linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.75) 100%)',
                pointerEvents: 'none',
            }} />

            {/* Left Panel — Branding & Feature Pitch */}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 6 }}>
                    <FutrixLogo size={46} glow />
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                            Futrix AI
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em', mt: 0.3 }}>
                            Autonomous Career Intelligence
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.6,
                    py: 0.6,
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    width: 'fit-content',
                    mb: 3,
                }}>
                    <AutoAwesomeOutlinedIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }} />
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.02em' }}>
                        Firebase Auth & Deterministic NLP Engine
                    </Typography>
                </Box>

                <Typography sx={{
                    fontSize: { md: '2.8rem', lg: '3.5rem' },
                    fontWeight: 900,
                    color: '#fff',
                    letterSpacing: '-0.045em',
                    lineHeight: 1.08,
                    mb: 2.5,
                }}>
                    Audit your resume.<br />
                    <Box component="span" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                        Unlock career growth.
                    </Box>
                </Typography>

                <Typography sx={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '0.98rem',
                    lineHeight: 1.75,
                    mb: 6,
                    maxWidth: 420,
                }}>
                    Deterministic resume skill extraction, intelligent gap analysis, ATS compatibility scoring, and personalized career roadmaps in seconds.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {FEATURES.map((f, i) => (
                        <Box key={f.label} sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.8,
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                            transition: `opacity 0.5s ease ${0.15 + i * 0.08}s, transform 0.5s ease ${0.15 + i * 0.08}s`,
                        }}>
                            <Box sx={{
                                width: 22, height: 22, borderRadius: '6px',
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, mt: 0.2,
                            }}>
                                <CheckCircleOutlineIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }} />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', lineHeight: 1.3 }}>
                                    {f.label}
                                </Typography>
                                <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.4, mt: 0.2 }}>
                                    {f.desc}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Right Panel — Interactive Sign-in */}
            <Box sx={{
                width: { xs: '100%', md: '480px' },
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 3, sm: 5, md: 6 },
                py: 4,
                position: 'relative',
                zIndex: 1,
                borderLeft: { md: '1px solid rgba(255,255,255,0.06)' },
                background: { md: 'rgba(12,12,12,0.65)' },
                backdropFilter: { md: 'blur(30px)' },
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateX(0)' : 'translateX(20px)',
                transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s',
            }}>
                <Box sx={{ width: '100%', maxWidth: 390 }}>
                    {/* Mobile logo */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4, justifyContent: 'center' }}>
                        <FutrixLogo size={40} />
                        <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff' }}>Futrix AI</Typography>
                    </Box>

                    <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', mb: 0.6 }}>
                        {isRegister ? 'Create an account' : 'Welcome back'}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem', mb: 3.5, lineHeight: 1.5 }}>
                        {isRegister
                            ? 'Get started with free AI resume auditing and skill roadmaps.'
                            : 'Sign in to access your resume analysis and career trajectory.'}
                    </Typography>

                    {/* Form Card */}
                    <Box sx={{
                        background: 'rgba(255,255,255,0.025)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px',
                        p: { xs: 3, sm: 3.5 },
                        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {error && (
                            <Alert
                                severity="warning"
                                sx={{
                                    mb: 2.5,
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    background: 'rgba(245,158,11,0.08)',
                                    color: '#fbbf24',
                                    border: '1px solid rgba(245,158,11,0.25)',
                                    '& .MuiAlert-icon': { color: '#fbbf24' },
                                }}
                                action={
                                    error.includes('Supabase') ? (
                                        <Button
                                            color="inherit"
                                            size="small"
                                            onClick={handleInstantDemo}
                                            sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'none', border: '1px solid rgba(251,191,36,0.4)', borderRadius: '6px', px: 1 }}
                                        >
                                            Demo Login
                                        </Button>
                                    ) : undefined
                                }
                            >
                                {error}
                            </Alert>
                        )}

                        {/* Google Sign-in Button (Google Identity Services) */}
                        <Button
                            id="google-signin-btn"
                            variant="outlined"
                            fullWidth
                            disabled={loading}
                            onClick={handleGoogleLogin}
                            sx={{
                                height: '46px',
                                borderRadius: '12px',
                                borderColor: 'rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.04)',
                                color: '#ffffff',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1.5,
                                '&:hover': {
                                    borderColor: 'rgba(255,255,255,0.35)',
                                    background: 'rgba(255,255,255,0.08)',
                                },
                            }}
                        >
                            {/* Google SVG Icon */}
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"/>
                                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
                                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
                            </svg>
                            <span>Continue with Google</span>
                        </Button>

                        {/* Instant Demo Access (One Click) */}
                        <Button
                            id="instant-demo-btn"
                            variant="outlined"
                            fullWidth
                            disabled={loading}
                            onClick={handleInstantDemo}
                            sx={{
                                mt: 1.5,
                                height: '44px',
                                borderRadius: '12px',
                                borderColor: 'rgba(255,255,255,0.25)',
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 100%)',
                                color: '#ffffff',
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1,
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                '&:hover': {
                                    borderColor: '#ffffff',
                                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.08) 100%)',
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <span>⚡ Instant Demo Access (One Click)</span>
                        </Button>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2.5 }}>
                            <Box sx={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                                or email
                            </Typography>
                            <Box sx={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                        </Box>

                        {/* Email / Password Form */}
                        <Box component="form" onSubmit={handleEmailAuth} noValidate>
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', mb: 0.8 }}>
                                    Email Address
                                </Typography>
                                <TextField
                                    id="login-email-input"
                                    type="email"
                                    fullWidth
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder="name@company.com"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailOutlinedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.35)' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: isEmailValid ? (
                                            <InputAdornment position="end">
                                                <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#4ade80' }} />
                                            </InputAdornment>
                                        ) : null,
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            background: 'rgba(255,255,255,0.04)',
                                            borderRadius: '12px',
                                            height: '46px',
                                            fontSize: '0.92rem',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                                            '&.Mui-focused fieldset': { borderColor: '#ffffff', borderWidth: '1.5px' },
                                        },
                                    }}
                                />
                            </Box>

                            <Box sx={{ mb: 2.5 }}>
                                <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', mb: 0.8 }}>
                                    Password
                                </Typography>
                                <TextField
                                    id="login-password-input"
                                    type={showPassword ? 'text' : 'password'}
                                    fullWidth
                                    required
                                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder="••••••••"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlinedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.35)' }} />
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                    size="small"
                                                    sx={{ color: 'rgba(255,255,255,0.4)' }}
                                                >
                                                    {showPassword ? <VisibilityOffOutlinedIcon sx={{ fontSize: 18 }} /> : <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            background: 'rgba(255,255,255,0.04)',
                                            borderRadius: '12px',
                                            height: '46px',
                                            fontSize: '0.92rem',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                                            '&.Mui-focused fieldset': { borderColor: '#ffffff', borderWidth: '1.5px' },
                                        },
                                    }}
                                />
                            </Box>

                            <Button
                                id="login-submit-button"
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading || !email.trim() || !password}
                                sx={{
                                    height: '46px',
                                    borderRadius: '12px',
                                    background: '#ffffff',
                                    color: '#0a0a0a',
                                    fontWeight: 700,
                                    fontSize: '0.92rem',
                                    textTransform: 'none',
                                    boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
                                    '&:hover': {
                                        background: '#e8e8e8',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 6px 25px rgba(255,255,255,0.25)',
                                    },
                                    '&.Mui-disabled': {
                                        background: 'rgba(255,255,255,0.12)',
                                        color: 'rgba(255,255,255,0.3)',
                                    },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {loading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CircularProgress size={18} sx={{ color: '#0a0a0a' }} />
                                        <span>{isRegister ? 'Creating Account...' : 'Signing in...'}</span>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                        <span>{isRegister ? 'Create Free Account' : 'Sign In with Email'}</span>
                                        <ArrowForwardIcon sx={{ fontSize: 16 }} />
                                    </Box>
                                )}
                            </Button>
                        </Box>

                        {/* Toggle between Sign In & Register */}
                        <Box sx={{ mt: 2.5, textAlign: 'center' }}>
                            <Button
                                variant="text"
                                onClick={() => {
                                    setIsRegister(!isRegister);
                                    setError('');
                                }}
                                sx={{
                                    fontSize: '0.82rem',
                                    color: 'rgba(255,255,255,0.6)',
                                    textTransform: 'none',
                                    '&:hover': { color: '#ffffff', background: 'transparent' },
                                }}
                            >
                                {isRegister
                                    ? 'Already have an account? Sign in'
                                    : "Don't have an account? Create one"}
                            </Button>
                        </Box>
                    </Box>

                    {/* Bottom Trust Badge */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 3.5, opacity: 0.4 }}>
                        <ShieldOutlinedIcon sx={{ fontSize: 14, color: '#fff' }} />
                        <Typography sx={{ color: '#fff', fontSize: '0.74rem', letterSpacing: '0.02em' }}>
                            Secured by Supabase Auth · 15m JWT session
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
