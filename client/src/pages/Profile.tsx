import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import apiService from '../services/apiService';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';

interface AnalysisData {
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap: string[];
}

interface UserProfile {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
    createdAt?: string;
    lastLogin?: string;
}

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box sx={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: '18px', ...sx }}>
            {children}
        </Box>
    );
}

function RowItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ color: 'rgba(255,255,255,0.25)', display: 'flex', width: 20 }}>{icon}</Box>
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', flex: 1 }}>{label}</Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{value}</Typography>
        </Box>
    );
}

export default function Profile() {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [historyCount, setHistoryCount] = useState<number>(0);
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();
    const { email: authEmail, name: authName, avatar: authAvatar, refreshToken, clearAuth } = useAuth();
    
    const email = authEmail || localStorage.getItem('userEmail') || 'user@example.com';
    const name = authName || profile?.name || email.split('@')[0];
    const initials = (name || email).slice(0, 2).toUpperCase();

    useEffect(() => {
        const loadProfile = async () => {
            const stored = localStorage.getItem('analysisResult');
            if (stored) { 
                try { setData(JSON.parse(stored)); } catch { /* */ } 
            }

            try {
                const userProf = await apiService.get<UserProfile>('/api/profile');
                if (userProf) setProfile(userProf);
            } catch {
                // Profile API error fallback
            }

            try {
                const hist = await apiService.get<any[]>('/api/history');
                if (Array.isArray(hist)) setHistoryCount(hist.length);
            } catch {
                // History API error fallback
            }

            setMounted(true);
        };

        loadProfile();
    }, []);

    const handleLogout = async () => {
        try {
            if (refreshToken) {
                await apiService.post('/api/auth/logout', { refreshToken });
            }
        } catch (err) {
            console.error('[Profile] Logout API error:', err);
        } finally {
            clearAuth();
            navigate('/login', { replace: true });
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>

            {/* Header */}
            <Box sx={{ mb: 5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                    Account
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', mb: 0.8 }}>
                    Profile
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>
                    Manage your account and authentication settings
                </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '280px 1fr' }, gap: 3, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.06s' }}>

                {/* Avatar card */}
                <Box>
                    <GlassCard sx={{ p: 3.5, textAlign: 'center', mb: 2 }}>
                        <Avatar 
                            src={authAvatar || profile?.avatar}
                            sx={{
                                width: 72, height: 72, mx: 'auto', mb: 2,
                                fontSize: '1.6rem', fontWeight: 800,
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: '#fff',
                            }}
                        >
                            {initials}
                        </Avatar>
                        <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1rem', letterSpacing: '-0.02em', mb: 0.4 }}>
                            {name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', mb: 2.5 }}>
                            {email}
                        </Typography>
                        <Chip label="Standard Plan" size="small" sx={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', fontWeight: 600, fontSize: '0.72rem' }} />
                    </GlassCard>

                    {/* Quick stats */}
                    {data && (
                        <GlassCard sx={{ p: 2.5 }}>
                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5 }}>
                                Active Analysis
                            </Typography>
                            {[
                                { icon: <BoltOutlinedIcon sx={{ fontSize: 15 }} />, label: 'Readiness', value: `${data.readiness_score || 0}%` },
                                { icon: <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />, label: 'Skills Found', value: String(data.skills?.length || 0) },
                                { icon: <TrendingUpOutlinedIcon sx={{ fontSize: 15 }} />, label: 'Gaps', value: String(data.gap_skills?.length || 0) },
                            ].map(({ icon, label, value }) => (
                                <Box key={label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.3, borderBottom: '1px solid rgba(255,255,255,0.05)', '&:last-child': { borderBottom: 'none' } }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ color: 'rgba(255,255,255,0.25)' }}>{icon}</Box>
                                        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{label}</Typography>
                                    </Box>
                                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{value}</Typography>
                                </Box>
                            ))}
                        </GlassCard>
                    )}
                </Box>

                {/* Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                    {/* Account info */}
                    <GlassCard sx={{ p: 3.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PersonOutlineIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Account Info</Typography>
                        </Box>
                        <Divider sx={{ mb: 1 }} />
                        <RowItem icon={<EmailOutlinedIcon sx={{ fontSize: 15 }} />} label="Email" value={email} />
                        <RowItem icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />} label="Account Type" value="Google OAuth / Email" />
                        <RowItem icon={<BoltOutlinedIcon sx={{ fontSize: 15 }} />} label="Analyses Recorded" value={String(historyCount || (data ? 1 : 0))} />
                    </GlassCard>

                    {/* Pro features overview */}
                    <GlassCard sx={{ p: 3.5, borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#fff', letterSpacing: '-0.025em', mb: 0.5 }}>
                            Career Twin Capabilities
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', mb: 2.5, lineHeight: 1.7 }}>
                            All career twin features — NLP text analysis, deterministic scoring, gap detection, and personalized roadmaps — are active on your account.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            {['NLP Analysis', 'Gap Detection', 'History Tracking', 'AI Career Roadmap'].map(f => (
                                <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                                    <CheckCircleOutlineIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }} />
                                    <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{f}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </GlassCard>

                    {/* Session Management */}
                    <GlassCard sx={{ p: 3.5 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', mb: 2 }}>
                            Session Management
                        </Typography>
                        <Divider sx={{ mb: 2.5 }} />
                        <Button
                            variant="outlined"
                            startIcon={<LogoutOutlinedIcon />}
                            onClick={handleLogout}
                            sx={{
                                borderColor: 'rgba(248,113,113,0.25)',
                                color: 'rgba(248,113,113,0.65)',
                                borderRadius: '10px',
                                fontSize: '0.85rem',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    borderColor: 'rgba(248,113,113,0.5)',
                                    background: 'rgba(248,113,113,0.06)',
                                    color: '#f87171',
                                },
                            }}
                        >
                            Sign Out
                        </Button>
                    </GlassCard>
                </Box>
            </Box>
        </Box>
    );
}
