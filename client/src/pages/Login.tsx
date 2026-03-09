import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import BiotechIcon from '@mui/icons-material/Biotech';
import ShieldIcon from '@mui/icons-material/Shield';
import BoltIcon from '@mui/icons-material/Bolt';
import LockIcon from '@mui/icons-material/Lock';

// ─── Feature pills ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🎯', label: 'Skill Extraction' },
  { icon: '📊', label: 'Gap Analysis' },
  { icon: '🚀', label: 'Career Roadmap' },
  { icon: '✨', label: 'Readiness Score' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Clear any stale session so the app always starts at login
  useEffect(() => {
    localStorage.clear();
  }, []);

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
        localStorage.setItem('token', data.token);
        localStorage.setItem('userEmail', email);
        navigate('/upload');
      } else {
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('Cannot connect to server. Make sure Node.js API is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: 'linear-gradient(160deg, #040f24 0%, #071730 40%, #0a2548 100%)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* ── Background ambient glows ── */}
      <Box sx={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: '55vw', height: '55vh', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,180,234,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: '65vw', height: '65vh', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,109,205,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      {/* Circuit grid pattern */}
      <Box sx={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: `
          linear-gradient(rgba(0,180,234,1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,180,234,1) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* ── Left Panel (Branding) ── */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          px: { md: 6, lg: 10 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 6 }}>
          <Box sx={{
            width: 48, height: 48, borderRadius: '14px',
            background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 28px rgba(0,180,234,0.4)',
          }}>
            <BiotechIcon sx={{ color: '#fff', fontSize: 26 }} />
          </Box>
          <Typography sx={{
            fontWeight: 800, fontSize: '1.4rem', color: '#fff',
            letterSpacing: '-0.03em',
            '& span': { color: '#00b4ea' },
          }}>
            Career<span>Twin</span> AI
          </Typography>
        </Box>

        {/* Headline */}
        <Typography sx={{
          fontSize: { md: '2.4rem', lg: '3rem' },
          fontWeight: 800,
          color: '#ffffff',
          letterSpacing: '-0.04em',
          lineHeight: 1.1,
          mb: 2.5,
        }}>
          Your AI-Powered
          <Box component="span" sx={{
            display: 'block',
            background: 'linear-gradient(135deg, #00b4ea, #00d4ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Career Intelligence
          </Box>
        </Typography>

        <Typography sx={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '1rem',
          lineHeight: 1.8,
          mb: 5,
          maxWidth: 420,
        }}>
          Upload your resume and instantly get AI-driven skill analysis, gap identification, and a personalized learning roadmap.
        </Typography>

        {/* Feature pills */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {FEATURES.map((f) => (
            <Box
              key={f.label}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 2, py: 0.9,
                borderRadius: '30px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(0,180,234,0.2)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Typography sx={{ fontSize: '1rem' }}>{f.icon}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', fontWeight: 500 }}>
                {f.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Right Panel (Login Form) ── */}
      <Box
        sx={{
          width: { xs: '100%', md: '480px' },
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 4, md: 5 },
          py: 4,
          position: 'relative',
          zIndex: 1,
          background: { md: 'rgba(255,255,255,0.03)' },
          borderLeft: { md: '1px solid rgba(0,180,234,0.08)' },
          backdropFilter: { md: 'blur(20px)' },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 5, justifyContent: 'center' }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '12px',
              background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 20px rgba(0,180,234,0.4)',
            }}>
              <BiotechIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.03em' }}>
              CareerTwin AI
            </Typography>
          </Box>

          {/* Form heading */}
          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', mb: 0.8 }}>
            Sign in
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', mb: 4 }}>
            No password needed — just your email to begin.
          </Typography>

          {/* ── Login Card ── */}
          <Card sx={{
            background: 'rgba(255,255,255,0.97)',
            border: '1px solid rgba(0,180,234,0.2)',
            borderRadius: '20px',
            boxShadow: '0 24px 64px rgba(4,15,36,0.5), 0 0 0 1px rgba(0,180,234,0.1)',
            overflow: 'visible',
          }}>
            {/* Top blue accent bar */}
            <Box sx={{
              height: 4,
              background: 'linear-gradient(90deg, #0e6dcd 0%, #00b4ea 50%, #00d4ff 100%)',
              borderRadius: '20px 20px 0 0',
            }} />

            <CardContent sx={{ p: { xs: 3, sm: 4 }, pt: { xs: 3 } }}>
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
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
                    {error}
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
                    fontSize: '0.95rem',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
                    boxShadow: '0 6px 24px rgba(14,109,205,0.45)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0a5db0 0%, #0e6dcd 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 10px 32px rgba(14,109,205,0.55)',
                    },
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CircularProgress size={18} sx={{ color: 'rgba(255,255,255,0.8)' }} />
                      Signing in...
                    </Box>
                  ) : (
                    'Start Career Analysis →'
                  )}
                </Button>
              </Box>

              {/* Trust badges */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3.5 }}>
                {[
                  { icon: <ShieldIcon sx={{ fontSize: 13 }} />, text: 'Secure' },
                  { icon: <BoltIcon sx={{ fontSize: 13 }} />, text: 'Instant' },
                  { icon: <LockIcon sx={{ fontSize: 13 }} />, text: 'JWT Auth' },
                ].map(({ icon, text }) => (
                  <Box key={text} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ color: '#00b4ea' }}>{icon}</Box>
                    <Typography sx={{ fontSize: '0.73rem', color: '#3a5a80', fontWeight: 500 }}>{text}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
