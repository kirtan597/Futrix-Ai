import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import BiotechIcon from '@mui/icons-material/Biotech';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import ReplayIcon from '@mui/icons-material/Replay';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EastIcon from '@mui/icons-material/East';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AnalysisData {
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap: string[];
}

// ─── Score donut ring ─────────────────────────────────────────────────────────
function ScoreRing({ score, animated }: { score: number; animated: boolean }) {
    const r = 68;
    const circ = 2 * Math.PI * r;
    const progress = animated ? ((100 - score) / 100) * circ : circ;

    // Ocean-themed colors
    const color =
        score >= 80 ? '#00b894' :
        score >= 60 ? '#00b4ea' :
        score >= 40 ? '#f59e0b' : '#ef4444';

    const label =
        score >= 80 ? 'Excellent' :
        score >= 60 ? 'Good' :
        score >= 40 ? 'Fair' : 'Developing';

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={160} height={160} style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle cx={80} cy={80} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={10} />
                {/* Progress */}
                <circle
                    cx={80} cy={80} r={r} fill="none"
                    stroke={color} strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={progress}
                    style={{
                        transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)',
                        filter: `drop-shadow(0 0 10px ${color}99)`,
                    }}
                />
            </svg>
            {/* Center text */}
            <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '2.4rem', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {score}
                </Typography>
                <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', mt: 0.4 }}>
                    {label}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function useCounter(target: number, duration = 1200) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        let start = 0;
        const step = Math.ceil(target / (duration / 16));
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setVal(target); clearInterval(timer); }
            else setVal(start);
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return val;
}

// ─── Skill Badge ──────────────────────────────────────────────────────────────
function SkillBadge({ label, variant }: { label: string; variant: 'skill' | 'gap' }) {
    return (
        <Box
            sx={{
                display: 'inline-flex', alignItems: 'center',
                px: 1.5, py: 0.6,
                borderRadius: '8px',
                fontSize: '0.78rem', fontWeight: 600,
                cursor: 'default',
                transition: 'all 0.18s',
                ...(variant === 'skill' ? {
                    background: 'rgba(0,184,148,0.1)',
                    border: '1px solid rgba(0,184,148,0.25)',
                    color: '#00b894',
                    '&:hover': { background: 'rgba(0,184,148,0.18)', borderColor: 'rgba(0,184,148,0.45)', transform: 'translateY(-1px)' },
                } : {
                    background: 'rgba(0,180,234,0.1)',
                    border: '1px solid rgba(0,180,234,0.25)',
                    color: '#0099cc',
                    '&:hover': { background: 'rgba(0,180,234,0.18)', borderColor: 'rgba(0,180,234,0.45)', transform: 'translateY(-1px)' },
                }),
            }}
        >
            {label}
        </Box>
    );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
    icon, value, title, sub, iconBg, iconColor, valuColor,
}: {
    icon: React.ReactNode; value: number | string; title: string; sub: string;
    iconBg: string; iconColor: string; valuColor: string;
}) {
    return (
        <Box
            sx={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '18px',
                p: 3.5,
                backdropFilter: 'blur(12px)',
                transition: 'all 0.25s',
                '&:hover': {
                    borderColor: 'rgba(0,180,234,0.3)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
                    transform: 'translateY(-3px)',
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{
                    p: 1.2, borderRadius: '10px',
                    background: iconBg,
                    border: `1px solid ${iconBg.replace('0.1', '0.25')}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Box sx={{ color: iconColor, display: 'flex', alignItems: 'center' }}>{icon}</Box>
                </Box>
                <Typography sx={{ fontSize: '2.6rem', fontWeight: 900, color: valuColor, letterSpacing: '-0.06em', lineHeight: 1 }}>
                    {value}
                </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', mb: 0.4 }}>{title}</Typography>
            <Typography sx={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.38)' }}>{sub}</Typography>
        </Box>
    );
}

// ─── Section Card (light glassmorphism) ───────────────────────────────────────
function OceanCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box
            sx={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '20px',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                transition: 'border-color 0.25s, box-shadow 0.25s, transform 0.25s',
                '&:hover': {
                    borderColor: 'rgba(0,180,234,0.2)',
                    boxShadow: '0 10px 48px rgba(0,0,0,0.3)',
                },
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
    icon, title, count, accentColor, countBg,
}: {
    icon: React.ReactNode; title: string; count?: number;
    accentColor: string; countBg?: string;
}) {
    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.5 }}>
                <Box sx={{ color: accentColor, display: 'flex', alignItems: 'center' }}>{icon}</Box>
                <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', flex: 1 }}>{title}</Typography>
                {count !== undefined && (
                    <Chip
                        label={count}
                        size="small"
                        sx={{
                            background: countBg ?? `rgba(0,180,234,0.12)`,
                            color: accentColor,
                            fontWeight: 700,
                            fontSize: '0.73rem',
                            border: `1px solid ${accentColor}33`,
                            height: 22,
                        }}
                    />
                )}
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2.5 }} />
        </>
    );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
    const navigate = useNavigate();
    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(145deg, #040f24 0%, #071730 45%, #0a2548 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2,
            position: 'relative', overflow: 'hidden',
        }}>
            {/* Background orbs */}
            <Box sx={{ position: 'fixed', top: '-20%', left: '-10%', width: '55vw', height: '55vh', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,234,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '60vw', height: '60vh', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,109,205,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <Box sx={{ textAlign: 'center', maxWidth: 480, position: 'relative', zIndex: 1 }}>
                {/* Icon */}
                <Box sx={{
                    width: 96, height: 96, borderRadius: '28px', mx: 'auto', mb: 4,
                    background: 'linear-gradient(135deg, rgba(0,180,234,0.15), rgba(14,109,205,0.08))',
                    border: '1px solid rgba(0,180,234,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 60px rgba(0,180,234,0.15)',
                    animation: 'float 3s ease-in-out infinite',
                }}>
                    <BiotechIcon sx={{ fontSize: 44, color: '#00b4ea' }} />
                </Box>

                <Typography sx={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.04em', mb: 1.5 }}>
                    No Analysis Yet
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.42)', lineHeight: 1.8, mb: 4.5, fontSize: '0.95rem' }}>
                    Upload your resume to generate a personalized AI career intelligence report with skill insights and a learning roadmap.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<UploadFileIcon />}
                    endIcon={<EastIcon />}
                    onClick={() => navigate('/upload')}
                    sx={{
                        background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
                        color: '#fff',
                        fontWeight: 700,
                        px: 4, py: 1.5,
                        borderRadius: '14px',
                        fontSize: '0.95rem',
                        boxShadow: '0 8px 28px rgba(14,109,205,0.5)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #0a5db0 0%, #0e6dcd 100%)',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 14px 40px rgba(14,109,205,0.6)',
                        },
                        transition: 'all 0.25s',
                    }}
                >
                    Analyze Resume
                </Button>
            </Box>
        </Box>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [animated, setAnimated] = useState(false);
    const navigate = useNavigate();
    const skillCount = useCounter(data?.skills.length ?? 0);
    const gapCount = useCounter(data?.gap_skills.length ?? 0);

    useEffect(() => {
        const stored = localStorage.getItem('analysisResult');
        if (stored) {
            try { setData(JSON.parse(stored)); } catch { /* ignore */ }
        }
    }, []);

    useEffect(() => {
        if (data) {
            const t = setTimeout(() => setAnimated(true), 200);
            return () => clearTimeout(t);
        }
    }, [data]);

    if (!data) return <EmptyState />;

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(145deg, #040f24 0%, #071730 45%, #0a2548 100%)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background ambient glows */}
            <Box sx={{ position: 'fixed', top: '-20%', left: '-10%', width: '55vw', height: '55vh', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,234,0.09) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
            <Box sx={{ position: 'fixed', bottom: '-20%', right: '-10%', width: '65vw', height: '65vh', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,109,205,0.07) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

            {/* Circuit grid overlay */}
            <Box sx={{
                position: 'fixed', inset: 0, opacity: 0.025, zIndex: 0,
                backgroundImage: `linear-gradient(rgba(0,180,234,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,234,1) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
                pointerEvents: 'none',
            }} />

            <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 1160, mx: 'auto', px: { xs: 2, sm: 3, md: 5 }, py: { xs: 4, md: 6 } }}>

                {/* ── Page Header ── */}
                <Box sx={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    mb: 5, flexWrap: 'wrap', gap: 2,
                    opacity: animated ? 1 : 0,
                    transform: animated ? 'translateY(0)' : 'translateY(-10px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',
                }}>
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                            <Box sx={{
                                width: 28, height: 28, borderRadius: '8px',
                                background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 4px 12px rgba(0,180,234,0.4)',
                            }}>
                                <BiotechIcon sx={{ color: '#fff', fontSize: 14 }} />
                            </Box>
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#00b4ea', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Career Intelligence Report
                            </Typography>
                        </Box>
                        <Typography sx={{
                            fontSize: { xs: '2rem', md: '2.6rem' },
                            fontWeight: 900,
                            color: '#fff',
                            letterSpacing: '-0.045em',
                            lineHeight: 1.05,
                        }}>
                            Your Career Twin
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.88rem', mt: 0.8 }}>
                            AI-powered analysis · Generated just now
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<ReplayIcon sx={{ fontSize: '1rem !important' }} />}
                        onClick={() => navigate('/upload')}
                        sx={{
                            borderColor: 'rgba(0,180,234,0.25)',
                            color: 'rgba(255,255,255,0.6)',
                            borderRadius: '10px',
                            px: 2.5,
                            fontSize: '0.85rem',
                            backdropFilter: 'blur(8px)',
                            '&:hover': {
                                borderColor: '#00b4ea',
                                background: 'rgba(0,180,234,0.08)',
                                color: '#00b4ea',
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s',
                        }}
                    >
                        Re-analyze
                    </Button>
                </Box>

                {/* ── TOP ROW: Score + Stats ── */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2.5, mb: 2.5 }}>

                    {/* Score card */}
                    <OceanCard sx={{
                        p: 4,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: 'linear-gradient(145deg, rgba(0,180,234,0.08) 0%, rgba(14,109,205,0.04) 100%)',
                        border: '1px solid rgba(0,180,234,0.18)',
                        gridRow: { md: 'span 2' },
                        position: 'relative', overflow: 'hidden',
                    }}>
                        {/* Corner glow */}
                        <Box sx={{ position: 'absolute', top: 0, right: 0, width: 100, height: 100, background: 'radial-gradient(circle at top right, rgba(0,180,234,0.15), transparent)', borderRadius: '0 20px 0 100px', pointerEvents: 'none' }} />

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 3 }}>
                            <WorkspacePremiumIcon sx={{ color: '#00b4ea', fontSize: 16 }} />
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                Readiness Score
                            </Typography>
                        </Box>

                        <ScoreRing score={data.readiness_score} animated={animated} />

                        <Divider sx={{ width: '60%', borderColor: 'rgba(255,255,255,0.07)', my: 3 }} />

                        <Typography sx={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.32)', textAlign: 'center', lineHeight: 1.7 }}>
                            Based on {data.skills.length} skill{data.skills.length !== 1 ? 's' : ''} detected in your resume
                        </Typography>
                    </OceanCard>

                    {/* Skills count */}
                    <StatCard
                        icon={<CheckCircleOutlineIcon sx={{ fontSize: 20 }} />}
                        value={skillCount}
                        title="Identified Skills"
                        sub="Matched from your resume"
                        iconBg="rgba(0,184,148,0.12)"
                        iconColor="#00b894"
                        valuColor="#00b894"
                    />

                    {/* Gaps count */}
                    <StatCard
                        icon={<TrendingUpIcon sx={{ fontSize: 20 }} />}
                        value={gapCount}
                        title="Skill Gaps"
                        sub="Areas to develop"
                        iconBg="rgba(0,180,234,0.12)"
                        iconColor="#00b4ea"
                        valuColor="#00b4ea"
                    />

                    {/* Roadmap count */}
                    <StatCard
                        icon={<AutoGraphIcon sx={{ fontSize: 20 }} />}
                        value={data.roadmap?.length ?? 0}
                        title="Roadmap Steps"
                        sub="Personalized action plan"
                        iconBg="rgba(99,102,241,0.12)"
                        iconColor="#818cf8"
                        valuColor="#818cf8"
                    />
                </Box>

                {/* ── SKILLS + GAPS ROW ── */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>

                    {/* Identified Skills */}
                    <OceanCard sx={{ p: 3.5 }}>
                        <SectionHeader
                            icon={<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />}
                            title="Identified Skills"
                            count={data.skills.length}
                            accentColor="#00b894"
                            countBg="rgba(0,184,148,0.12)"
                        />
                        {data.skills.length === 0 ? (
                            <Typography sx={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                No skills detected — try adding more detail to your resume.
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
                                {data.skills.map((s) => <SkillBadge key={s} label={s} variant="skill" />)}
                            </Box>
                        )}
                    </OceanCard>

                    {/* Skill Gaps */}
                    <OceanCard sx={{ p: 3.5 }}>
                        <SectionHeader
                            icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                            title="Skill Gaps to Bridge"
                            count={data.gap_skills.length}
                            accentColor="#00b4ea"
                            countBg="rgba(0,180,234,0.12)"
                        />
                        {data.gap_skills.length === 0 ? (
                            <Typography sx={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                No gaps found — great profile!
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
                                {data.gap_skills.map((g) => <SkillBadge key={g} label={g} variant="gap" />)}
                            </Box>
                        )}
                    </OceanCard>
                </Box>

                {/* ── ROADMAP ── */}
                <OceanCard sx={{ p: { xs: 3, md: 4 }, mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1 }}>
                        <AutoGraphIcon sx={{ color: '#818cf8', fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                            Your Learning Roadmap
                        </Typography>
                    </Box>
                    <Typography sx={{ color: 'rgba(255,255,255,0.32)', fontSize: '0.82rem', mb: 3.5 }}>
                        A personalized step-by-step plan to advance your career
                    </Typography>

                    {/* Timeline */}
                    <Box sx={{ position: 'relative', pl: 3 }}>
                        {/* Vertical gradient line */}
                        <Box sx={{
                            position: 'absolute', left: '10px', top: '14px', bottom: '14px',
                            width: '1px',
                            background: 'linear-gradient(to bottom, rgba(0,180,234,0.6), rgba(0,180,234,0.05))',
                        }} />

                        {data.roadmap?.map((step, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2.5,
                                    opacity: animated ? 1 : 0,
                                    transform: animated ? 'translateY(0)' : 'translateY(14px)',
                                    transition: `opacity 0.45s ease ${i * 0.09}s, transform 0.45s ease ${i * 0.09}s`,
                                }}
                            >
                                {/* Dot */}
                                <Box sx={{
                                    position: 'relative', zIndex: 1, flexShrink: 0,
                                    width: 22, height: 22, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: i === 0
                                        ? 'linear-gradient(135deg, #0e6dcd, #00b4ea)'
                                        : 'rgba(0,180,234,0.1)',
                                    border: i === 0 ? 'none' : '1px solid rgba(0,180,234,0.3)',
                                    boxShadow: i === 0 ? '0 0 18px rgba(0,180,234,0.6)' : 'none',
                                    mt: '2px',
                                }}>
                                    {i === 0
                                        ? <FiberManualRecordIcon sx={{ fontSize: 8, color: '#fff' }} />
                                        : <Typography sx={{ fontSize: '0.58rem', color: '#00b4ea', fontWeight: 700 }}>{i + 1}</Typography>
                                    }
                                </Box>

                                {/* Content */}
                                <Box sx={{
                                    flex: 1, p: 2.2,
                                    borderRadius: '13px',
                                    background: i === 0
                                        ? 'linear-gradient(135deg, rgba(14,109,205,0.12), rgba(0,180,234,0.06))'
                                        : 'rgba(255,255,255,0.025)',
                                    border: i === 0
                                        ? '1px solid rgba(0,180,234,0.25)'
                                        : '1px solid rgba(255,255,255,0.06)',
                                    transition: 'border-color 0.2s, background 0.2s',
                                    '&:hover': {
                                        borderColor: 'rgba(0,180,234,0.35)',
                                        background: 'rgba(0,180,234,0.07)',
                                    },
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                        <Typography sx={{
                                            fontSize: '0.88rem',
                                            fontWeight: i === 0 ? 600 : 500,
                                            color: i === 0 ? '#e0f2fe' : 'rgba(255,255,255,0.6)',
                                            lineHeight: 1.6,
                                        }}>
                                            {step}
                                        </Typography>
                                        {i === 0 && (
                                            <Chip
                                                label="Next"
                                                size="small"
                                                sx={{
                                                    background: 'rgba(0,180,234,0.18)',
                                                    color: '#00d4ff',
                                                    fontWeight: 700,
                                                    fontSize: '0.67rem',
                                                    border: '1px solid rgba(0,180,234,0.35)',
                                                    flexShrink: 0,
                                                    height: 20,
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </OceanCard>

                {/* ── CTA Banner ── */}
                <Box
                    sx={{
                        borderRadius: '22px',
                        background: 'linear-gradient(135deg, rgba(14,109,205,0.12) 0%, rgba(0,180,234,0.08) 100%)',
                        border: '1px solid rgba(0,180,234,0.2)',
                        p: { xs: 3, md: 4 },
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 2,
                        position: 'relative', overflow: 'hidden',
                        backdropFilter: 'blur(12px)',
                        opacity: animated ? 1 : 0,
                        transform: animated ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.5s ease 0.6s, transform 0.5s ease 0.6s',
                    }}
                >
                    {/* Glow orb */}
                    <Box sx={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,234,0.12), transparent)', pointerEvents: 'none' }} />

                    <Box>
                        <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', mb: 0.5, letterSpacing: '-0.02em' }}>
                            Ready to level up?
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.38)', fontSize: '0.85rem' }}>
                            Update your resume with new skills and re-analyze to track progress.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        endIcon={<EastIcon sx={{ fontSize: '1rem !important' }} />}
                        onClick={() => navigate('/upload')}
                        sx={{
                            background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
                            color: '#fff',
                            fontWeight: 700,
                            px: 3.5, py: 1.3,
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            flexShrink: 0,
                            boxShadow: '0 6px 24px rgba(14,109,205,0.45)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0a5db0 0%, #0e6dcd 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 36px rgba(14,109,205,0.6)',
                            },
                            transition: 'all 0.25s',
                        }}
                    >
                        Analyze New Resume
                    </Button>
                </Box>

            </Box>
        </Box>
    );
}
