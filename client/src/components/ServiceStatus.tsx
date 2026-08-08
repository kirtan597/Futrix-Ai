import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

const API = import.meta.env.DEV
    ? ''
    : (import.meta.env.VITE_API_URL || 'https://futrix-node-api.onrender.com').replace(/\/$/, '');

type Status = 'checking' | 'online' | 'waking' | 'offline';

export default function ServiceStatus() {
    const [status, setStatus] = useState<Status>('checking');
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
            let attempts = 0;

            const check = async () => {
            try {
                const res = await fetch(`${API}/health`, { signal: AbortSignal.timeout(6000) });
                if (res.ok) {
                    setStatus('online');
                    clearInterval(timer);
                    return;
                }
            } catch { /* still waking */ }

            attempts++;
            if (attempts === 1) setStatus('waking');
            if (attempts > 10) { setStatus('offline'); clearInterval(timer); }
        };

        const timer = setInterval(() => {
            setElapsed(e => e + 5);
            check();
        }, 5000);
        check(); // immediate first check

        return () => clearInterval(timer);
    }, []);

    if (status === 'online' || status === 'checking') return null;

    return (
        <Box sx={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
            background: status === 'offline' ? 'rgba(239,68,68,0.12)' : 'rgba(251,191,36,0.08)',
            borderBottom: `1px solid ${status === 'offline' ? 'rgba(239,68,68,0.25)' : 'rgba(251,191,36,0.2)'}`,
            backdropFilter: 'blur(12px)',
            px: 3, py: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5,
        }}>
            {status === 'waking' && (
                <CircularProgress size={12} thickness={5} sx={{ color: 'rgba(251,191,36,0.7)' }} />
            )}
            <Typography sx={{
                fontSize: '0.78rem', fontWeight: 600,
                color: status === 'offline' ? 'rgba(239,68,68,0.85)' : 'rgba(251,191,36,0.85)',
            }}>
                {status === 'waking'
                    ? `Server is waking up on free tier — login will work in ~${Math.max(0, 30 - elapsed)}s`
                    : 'Server appears to be offline. Please try again later.'}
            </Typography>
        </Box>
    );
}
