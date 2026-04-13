import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';

import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import EastIcon from '@mui/icons-material/East';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import NorthOutlinedIcon from '@mui/icons-material/NorthOutlined';
import SouthOutlinedIcon from '@mui/icons-material/SouthOutlined';

import ScoreRing from '../components/ScoreRing';
import SkillRadar from '../components/charts/SkillRadar';
import GapDonut from '../components/charts/GapDonut';
import ScoreArea from '../components/charts/ScoreArea';

// ─── Types ──────────────────────────────────────────────────────────────────
interface AnalysisData {
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap: string[];
}

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCounter(target: number, delay = 0) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        const timeout = setTimeout(() => {
            let start = 0;
            const step = Math.ceil(target / 45);
            const timer = setInterval(() => {
                start = Math.min(start + step, target);
                setVal(start);
                if (start >= target) clearInterval(timer);
            }, 22);
            return () => clearInterval(timer);
        }, delay);
        return () => clearTimeout(timeout);
    }, [target, delay]);
    return val;
}

// ─── Glass Card ──────────────────────────────────────────────────────────────
function GlassCard({ children, sx = {}, hover = true }: { children: React.ReactNode; sx?: object; hover?: boolean }) {
    return (
        <Box sx={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.065)',
            borderRadius: '18px',
            transition: 'all 0.25s',
            ...(hover ? {
                '&:hover': {
                    borderColor: 'rgba(255,255,255,0.13)',
                    boxShadow: '0 12px 48px rgba(0,0,0,0.5)',
                    transform: 'translateY(-2px)',
                },
            } : {}),
            ...sx,
        }}>
            {children}
        </Box>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, sub, trend }: {
    icon: React.ReactNode;
    value: number | string;
    label: string;
    sub: string;
    trend?: 'up' | 'down' | 'neutral';
}) {
    return (
        <GlassCard sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5 }}>
                <Box sx={{
                    width: 36, height: 36, borderRadius: '10px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                }}>
                    {icon}
                </Box>
                {trend && (
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.4,
                        color: trend === 'up' ? '#4ade80' : trend === 'down' ? '#f87171' : 'rgba(255,255,255,0.3)',
                        fontSize: '0.72rem', fontWeight: 600,
                    }}>
                        {trend === 'up' ? <NorthOutlinedIcon sx={{ fontSize: 12 }} /> :
                         trend === 'down' ? <SouthOutlinedIcon sx={{ fontSize: 12 }} /> : null}
                        {trend === 'up' ? '+12%' : trend === 'down' ? '-3%' : 'stable'}
                    </Box>
                )}
            </Box>
            <Typography sx={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.06em', lineHeight: 1, mb: 0.6 }}>
                {value}
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', mb: 0.3 }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>
                {sub}
            </Typography>
        </GlassCard>
    );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState() {
    const navigate = useNavigate();
    return (
        <Box sx={{
            flex: 1,
            minHeight: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            px: 3,
            background: '#0a0a0a',
            position: 'relative',
        }}>
            <Box className="dot-grid" sx={{ position: 'absolute', inset: 0 }} />
            <Box sx={{ textAlign: 'center', maxWidth: 440, position: 'relative', zIndex: 1 }}>
                <Box sx={{
                    width: 80, height: 80, borderRadius: '22px', mx: 'auto', mb: 4,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'float 3.5s ease-in-out infinite',
                }}>
                    <UploadFileOutlinedIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.4)' }} />
                </Box>

                <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', mb: 1.5 }}>
                    No Analysis Yet
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, mb: 5, fontSize: '0.92rem' }}>
                    Upload your resume to generate a personalized AI career intelligence report — skills, gaps, and a custom roadmap.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<UploadFileOutlinedIcon />}
                    endIcon={<EastIcon />}
                    onClick={() => navigate('/upload')}
                    sx={{ borderRadius: '12px', px: 4, py: 1.4, fontSize: '0.9rem' }}
                >
                    Analyze Resume
                </Button>
            </Box>
        </Box>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    const skillCount = useCounter(data?.skills.length ?? 0, 200);
    const gapCount   = useCounter(data?.gap_skills.length ?? 0, 300);
    const score      = useCounter(data?.readiness_score ?? 0, 100);

    useEffect(() => {
        const stored = localStorage.getItem('analysisResult');
        if (stored) {
            try { setData(JSON.parse(stored)); } catch { /* ignore */ }
        }
        const t = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(t);
    }, []);

    if (!data) return <EmptyState />;

    const coveragePct = data.skills.length > 0
        ? Math.round((data.skills.length / (data.skills.length + data.gap_skills.length)) * 100)
        : 0;

    return (
        <Box sx={{
            minHeight: '100vh',
            background: '#0a0a0a',
            py: { xs: 3, md: 5 },
            px: { xs: 2, sm: 3, md: 5 },
        }}>

            {/* ── Page Header ── */}
            <Box sx={{
                display: 'flex', alignItems: 'flex-start',
                justifyContent: 'space-between',
                mb: 5, flexWrap: 'wrap', gap: 2,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(-12px)',
                transition: 'opacity 0.5s, transform 0.5s',
            }}>
                <Box>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                        Career Intelligence Report
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                        Your Dashboard
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.85rem', mt: 0.8 }}>
                        AI-powered analysis · Last updated just now
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate('/result')}
                        sx={{ borderRadius: '9px', fontSize: '0.8rem', px: 2 }}
                    >
                        Full Report
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<UploadFileOutlinedIcon sx={{ fontSize: '15px !important' }} />}
                        onClick={() => navigate('/upload')}
                        sx={{ borderRadius: '9px', fontSize: '0.8rem', px: 2 }}
                    >
                        Re-analyze
                    </Button>
                </Box>
            </Box>

            {/* ── ROW 1: Stats + Score ── */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
                gap: 2.5, mb: 2.5,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(14px)',
                transition: 'opacity 0.5s 0.08s, transform 0.5s 0.08s',
            }}>
                <StatCard
                    icon={<BoltOutlinedIcon sx={{ fontSize: 18 }} />}
                    value={score}
                    label="Readiness Score"
                    sub="Overall career readiness"
                    trend="up"
                />
                <StatCard
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}
                    value={skillCount}
                    label="Identified Skills"
                    sub="Matched from your resume"
                    trend="neutral"
                />
                <StatCard
                    icon={<TrendingUpOutlinedIcon sx={{ fontSize: 18 }} />}
                    value={gapCount}
                    label="Skill Gaps"
                    sub="Areas to develop"
                    trend="down"
                />
                <StatCard
                    icon={<AutoGraphOutlinedIcon sx={{ fontSize: 18 }} />}
                    value={data.roadmap?.length ?? 0}
                    label="Roadmap Steps"
                    sub="Personalized action plan"
                    trend="neutral"
                />
            </Box>

            {/* ── ROW 2: Score ring + Score area + Donut ── */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '240px 1fr 240px' },
                gap: 2.5, mb: 2.5,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(14px)',
                transition: 'opacity 0.5s 0.14s, transform 0.5s 0.14s',
            }}>
                {/* Score ring card */}
                <GlassCard sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 2.5 }}>
                        Readiness
                    </Typography>
                    <ScoreRing score={data.readiness_score} size={150} animated />
                    <Divider sx={{ width: '70%', my: 2.5 }} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.7 }}>
                        Based on {data.skills.length} skills detected
                    </Typography>
                </GlassCard>

                {/* Score area */}
                <GlassCard sx={{ p: 3 }}>
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', mb: 0.5 }}>
                        Score Progression
                    </Typography>
                    <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.22)', mb: 2.5 }}>
                        Estimated growth over the last 6 months
                    </Typography>
                    <ScoreArea currentScore={data.readiness_score} />
                </GlassCard>

                {/* Gap donut */}
                <GlassCard sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 1 }}>
                        Coverage
                    </Typography>
                    <GapDonut skillsCount={data.skills.length} gapCount={data.gap_skills.length} />
                    <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1, mt: -1 }}>
                        {coveragePct}%
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mt: 0.5 }}>
                        Skill coverage ratio
                    </Typography>
                </GlassCard>
            </Box>

            {/* ── ROW 3: Skills + Radar ── */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 320px' },
                gap: 2.5, mb: 2.5,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(14px)',
                transition: 'opacity 0.5s 0.2s, transform 0.5s 0.2s',
            }}>
                {/* Skills */}
                <GlassCard sx={{ p: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Detected Skills</Typography>
                        </Box>
                        <Chip label={data.skills.length} size="small" sx={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontWeight: 700, border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.72rem' }} />
                    </Box>
                    <Divider sx={{ mb: 2.5 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
                        {data.skills.map((s, i) => (
                            <Box key={s} sx={{
                                px: 1.5, py: 0.55,
                                borderRadius: '7px',
                                fontSize: '0.77rem', fontWeight: 600,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.7)',
                                cursor: 'default',
                                transition: 'all 0.18s',
                                animation: `fadeUp 0.4s ease both`,
                                animationDelay: `${i * 0.03}s`,
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.1)',
                                    borderColor: 'rgba(255,255,255,0.25)',
                                    color: '#fff',
                                    transform: 'translateY(-1px)',
                                },
                            }}>
                                {s}
                            </Box>
                        ))}
                    </Box>

                    {/* Coverage bar */}
                    <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>Skill coverage</Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{coveragePct}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={coveragePct} />
                    </Box>
                </GlassCard>

                {/* Radar chart */}
                <GlassCard sx={{ p: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <AutoGraphOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Skill Radar</Typography>
                    </Box>
                    <Divider sx={{ mb: 2.5 }} />
                    <SkillRadar skills={data.skills} gapSkills={data.gap_skills} />
                </GlassCard>
            </Box>

            {/* ── ROW 4: Gaps + Roadmap peek ── */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2.5,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(14px)',
                transition: 'opacity 0.5s 0.26s, transform 0.5s 0.26s',
            }}>
                {/* Skill Gaps */}
                <GlassCard sx={{ p: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUpOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Skill Gaps</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip label={data.gap_skills.length} size="small" sx={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', fontWeight: 700, border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.72rem' }} />
                            <Button size="small" variant="text" onClick={() => navigate('/skills-gap')} sx={{ fontSize: '0.72rem', px: 1, py: 0.3, minHeight: 0, lineHeight: 1, borderRadius: '6px' }}>
                                Details →
                            </Button>
                        </Box>
                    </Box>
                    <Divider sx={{ mb: 2.5 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
                        {data.gap_skills.map((g, i) => (
                            <Box key={g} sx={{
                                px: 1.5, py: 0.55,
                                borderRadius: '7px',
                                fontSize: '0.77rem', fontWeight: 600,
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                color: 'rgba(255,255,255,0.4)',
                                cursor: 'default',
                                transition: 'all 0.18s',
                                animation: `fadeUp 0.4s ease both`,
                                animationDelay: `${i * 0.03}s`,
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.06)',
                                    borderColor: 'rgba(255,255,255,0.15)',
                                    color: 'rgba(255,255,255,0.7)',
                                    transform: 'translateY(-1px)',
                                },
                            }}>
                                {g}
                            </Box>
                        ))}
                    </Box>
                </GlassCard>

                {/* Roadmap preview */}
                <GlassCard sx={{ p: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AutoGraphOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Roadmap</Typography>
                        </Box>
                        <Button size="small" variant="text" onClick={() => navigate('/career-path')} sx={{ fontSize: '0.72rem', px: 1, py: 0.3, minHeight: 0, lineHeight: 1, borderRadius: '6px' }}>
                            View Path →
                        </Button>
                    </Box>
                    <Divider sx={{ mb: 2.5 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {data.roadmap?.slice(0, 4).map((step, i) => (
                            <Box key={i} sx={{
                                display: 'flex', alignItems: 'flex-start', gap: 2,
                                animation: `fadeUp 0.4s ease both`,
                                animationDelay: `${i * 0.06}s`,
                            }}>
                                <Box sx={{
                                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                                    background: i === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.1,
                                }}>
                                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.3)' }}>
                                        {i + 1}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    flex: 1, p: 1.5, borderRadius: '10px',
                                    background: i === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${i === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                                }}>
                                    <Typography sx={{ fontSize: '0.82rem', color: i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                                        {step}
                                    </Typography>
                                    {i === 0 && <Chip label="Next" size="small" sx={{ mt: 0.8, height: 18, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }} />}
                                </Box>
                            </Box>
                        ))}
                        {(data.roadmap?.length ?? 0) > 4 && (
                            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.22)', textAlign: 'center', mt: 1 }}>
                                +{data.roadmap.length - 4} more steps in Career Path
                            </Typography>
                        )}
                    </Box>
                </GlassCard>
            </Box>
        </Box>
    );
}
