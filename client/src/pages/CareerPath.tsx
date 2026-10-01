import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';

import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import EastIcon from '@mui/icons-material/East';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import apiService from '../services/apiService';

// ─── Default role catalog (used when AI hasn't returned career_paths) ─────────
const DEFAULT_ROLES = [
    { title: 'Full Stack Engineer',     salary: '$95k – $155k', demand: 'Very High', demandColor: '#4ade80', skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'] },
    { title: 'Backend Cloud Architect', salary: '$120k – $175k', demand: 'High',      demandColor: '#facc15', skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'] },
    { title: 'AI / ML Engineer',        salary: '$130k – $190k', demand: 'Very High', demandColor: '#4ade80', skills: ['Python', 'Machine Learning', 'FastAPI', 'Docker', 'PyTorch'] },
    { title: 'Frontend Specialist',     salary: '$90k – $140k',  demand: 'High',      demandColor: '#facc15', skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'Tailwind'] },
];

interface CareerPathItem {
    role: string;
    match_percent: number;
    salary_range: string;
    skills_needed: string[];
    matched_skills?: string[];
    missing_skills?: string[];
}

interface AnalysisData {
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap: string[];
    career_paths?: CareerPathItem[];
}

// ─── Shared glass card ────────────────────────────────────────────────────────
function GlassCard({ children, sx = {}, hover = false }: { children: React.ReactNode; sx?: object; hover?: boolean }) {
    return (
        <Box sx={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px',
            transition: 'all 0.22s ease',
            ...(hover ? {
                '&:hover': {
                    borderColor: 'rgba(255,255,255,0.15)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    transform: 'translateY(-2px)',
                }
            } : {}),
            ...sx,
        }}>
            {children}
        </Box>
    );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionLabel({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: sub ? 0.4 : 2 }}>
            <Box sx={{ color: 'rgba(255,255,255,0.3)', display: 'flex' }}>{icon}</Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{title}</Typography>
        </Box>
    );
}

// ─── Mini circular ring ───────────────────────────────────────────────────────
function MatchRing({ pct, size = 52 }: { pct: number; size?: number }) {
    const sw = 4, r = (size / 2) - sw;
    const circ = 2 * Math.PI * r;
    const offset = ((100 - Math.min(100, pct)) / 100) * circ;
    const color = pct >= 75 ? 'rgba(74,222,128,0.9)' : pct >= 50 ? 'rgba(250,204,21,0.85)' : 'rgba(248,113,113,0.7)';
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }} />
            </svg>
            <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color, lineHeight: 1 }}>{pct}%</Typography>
            </Box>
        </Box>
    );
}

// ─── Role Card (professional) ─────────────────────────────────────────────────
function RoleCard({
    title, salary, demand, demandColor, skills, userSkills, matchPct,
}: {
    title: string; salary: string; demand: string; demandColor: string;
    skills: string[]; userSkills: string[]; matchPct?: number;
}) {
    const matched = skills.filter(s => userSkills.some(u => u.toLowerCase() === s.toLowerCase()));
    const pct = matchPct ?? Math.round((matched.length / Math.max(skills.length, 1)) * 100);
    const missing = skills.filter(s => !userSkills.some(u => u.toLowerCase() === s.toLowerCase()));

    return (
        <GlassCard hover sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Top row */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.8 }}>
                <Box sx={{ flex: 1, pr: 1.5 }}>
                    <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem', letterSpacing: '-0.02em', mb: 0.3 }}>
                        {title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                        {salary}
                    </Typography>
                </Box>
                <MatchRing pct={pct} />
            </Box>

            {/* Demand badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.8 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: demandColor, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: demandColor, letterSpacing: '0.04em' }}>
                    {demand} Demand
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                    {matched.length}/{skills.length} matched
                </Typography>
            </Box>

            {/* Progress bar */}
            <Box sx={{ mb: 2 }}>
                <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                        height: 3, borderRadius: 2,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        '& .MuiLinearProgress-bar': {
                            background: `${demandColor}80`,
                            borderRadius: 2,
                        },
                    }}
                />
            </Box>

            {/* Skill chips */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mb: 1.5 }}>
                {skills.map(s => {
                    const has = userSkills.some(u => u.toLowerCase() === s.toLowerCase());
                    return (
                        <Chip key={s} label={s} size="small" sx={{
                            height: 20, fontSize: '0.62rem', fontWeight: 600,
                            background: has ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.03)',
                            color: has ? 'rgba(74,222,128,0.9)' : 'rgba(255,255,255,0.22)',
                            border: `1px solid ${has ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)'}`,
                        }} />
                    );
                })}
            </Box>

            {/* Missing skills note */}
            {missing.length > 0 && (
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(248,113,113,0.6)', fontWeight: 500, lineHeight: 1.5 }}>
                    {missing.length === 1
                        ? `Missing: ${missing[0]}`
                        : `${missing.length} skills to add: ${missing.slice(0, 2).join(', ')}${missing.length > 2 ? ` +${missing.length - 2}` : ''}`}
                </Typography>
            )}
        </GlassCard>
    );
}

// ─── Roadmap step list ────────────────────────────────────────────────────────
function RoadmapStepList({ steps }: { steps: string[] }) {
    if (!steps.length) {
        return (
            <Typography sx={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', py: 2 }}>
                No roadmap data available.
            </Typography>
        );
    }
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {steps.map((step, i) => (
                <Box key={i} sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1.5,
                    p: 1.5,
                    borderRadius: '12px',
                    background: i === 0 ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: `1px solid ${i === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}`,
                    transition: 'all 0.2s',
                    '&:hover': { background: 'rgba(255,255,255,0.035)', borderColor: 'rgba(255,255,255,0.1)' },
                }}>
                    {/* Step number */}
                    <Box sx={{
                        minWidth: 22, height: 22, borderRadius: '7px', flexShrink: 0,
                        background: i === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Typography sx={{
                            fontSize: '0.6rem', fontWeight: 900, lineHeight: 1,
                            color: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)',
                        }}>
                            {String(i + 1).padStart(2, '0')}
                        </Typography>
                    </Box>

                    {/* Text */}
                    <Typography sx={{
                        fontSize: '0.8rem', lineHeight: 1.5,
                        color: i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
                        fontWeight: i === 0 ? 600 : 400,
                        pt: 0.1,
                    }}>
                        {step}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}

// ─── Horizontal bar comparison chart ─────────────────────────────────────────
function FitComparisonChart({ roles }: { roles: { role: string; fit: number }[] }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {roles.map(r => (
                <Box key={r.role}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                        <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>
                            {r.role}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)' }}>
                            {r.fit}%
                        </Typography>
                    </Box>
                    <Box sx={{ height: 5, borderRadius: 2, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <Box sx={{
                            height: '100%', borderRadius: 2, width: `${r.fit}%`,
                            background: r.fit >= 75 ? 'rgba(74,222,128,0.6)' : r.fit >= 50 ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.25)',
                            transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                        }} />
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CareerPath() {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            const stored = localStorage.getItem('analysisResult');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed && typeof parsed === 'object') {
                        setData(parsed);
                        setMounted(true);
                        return;
                    }
                } catch { /* ignore */ }
            }
            try {
                const history = await apiService.get<any[]>('/api/history');
                if (Array.isArray(history) && history.length > 0) {
                    setData(history[0]);
                    localStorage.setItem('analysisResult', JSON.stringify(history[0]));
                }
            } catch (err) {
                console.error('[CareerPath] Failed to fetch history:', err);
            } finally {
                setMounted(true);
            }
        };
        load();
    }, []);

    // ── Empty state ──
    if (mounted && !data) {
        return (
            <Box sx={{
                minHeight: '100vh', background: '#0a0a0a',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: 2,
            }}>
                <WorkOutlineIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.15)' }} />
                <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem' }}>
                    No resume data found. Upload a resume to generate career paths.
                </Typography>
                <Button
                    variant="outlined" size="small"
                    onClick={() => navigate('/upload')}
                    endIcon={<EastIcon />}
                    sx={{ borderColor: 'rgba(255,255,255,0.18)', color: '#fff', borderRadius: '10px', textTransform: 'none', fontSize: '0.82rem' }}
                >
                    Upload Resume
                </Button>
            </Box>
        );
    }

    if (!data) return null;

    // ── Derived data ──
    const roadmap        = data.roadmap ?? [];
    const aiPaths        = data.career_paths?.length ? data.career_paths : null;
    const userSkills     = data.skills ?? [];

    const roleCompList = aiPaths
        ? [...aiPaths].sort((a, b) => b.match_percent - a.match_percent).map(p => ({ role: p.role, fit: p.match_percent }))
        : DEFAULT_ROLES.map(j => {
            const m = j.skills.filter(s => userSkills.some(u => u.toLowerCase() === s.toLowerCase())).length;
            return { role: j.title, fit: Math.max(Math.round((m / j.skills.length) * 100), 30) };
          }).sort((a, b) => b.fit - a.fit);

    const bestFit       = Math.max(...roleCompList.map(r => r.fit), 0);
    const totalRoles    = roleCompList.length;
    const readiness     = data.readiness_score ?? 0;
    const milestones    = roadmap.length;

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>

            {/* ── Page Header ── */}
            <Box sx={{ mb: 5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                    AI Career Intelligence
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', mb: 0.8, fontSize: { xs: '1.6rem', md: '2.125rem' } }}>
                    Career Pathways
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem', maxWidth: 480 }}>
                    Role fit analysis, salary benchmarks, and a step-by-step learning roadmap tailored to your skill profile.
                </Typography>
            </Box>

            {/* ── Stat row ── */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 2, mb: 3,
                opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.05s',
            }}>
                {[
                    { icon: <WorkOutlineIcon sx={{ fontSize: 17 }} />,          label: 'Target Roles',       value: totalRoles },
                    { icon: <BoltOutlinedIcon sx={{ fontSize: 17 }} />,         label: 'Readiness Score',    value: `${readiness}%` },
                    { icon: <CheckCircleOutlineIcon sx={{ fontSize: 17 }} />,   label: 'Best Role Fit',      value: `${bestFit}%` },
                    { icon: <TimelineOutlinedIcon sx={{ fontSize: 17 }} />,     label: 'Roadmap Steps',      value: milestones },
                ].map(({ icon, label, value }) => (
                    <GlassCard key={label} sx={{ p: { xs: 2, md: 2.5 } }}>
                        <Box sx={{ color: 'rgba(255,255,255,0.22)', mb: 1.5, display: 'flex' }}>{icon}</Box>
                        <Typography sx={{ fontSize: { xs: '1.7rem', md: '2rem' }, fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1, mb: 0.5 }}>
                            {value}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>{label}</Typography>
                    </GlassCard>
                ))}
            </Box>

            {/* ── Role Fit Comparison (full-width bar chart) ── */}
            <GlassCard sx={{ p: 3, mb: 3, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.08s' }}>
                <SectionLabel
                    icon={<BarChartOutlinedIcon sx={{ fontSize: 16 }} />}
                    title="Role Fit Comparison"
                />
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)', mb: 2.5 }}>
                    Skill alignment score across each target engineering trajectory
                </Typography>
                <FitComparisonChart roles={roleCompList} />
            </GlassCard>

            {/* ── Main grid: Role cards + Roadmap ── */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 360px' },
                gap: 3,
                opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.1s',
            }}>
                {/* Left — Role match cards */}
                <Box>
                    <GlassCard sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                            <SectionLabel
                                icon={<WorkOutlineIcon sx={{ fontSize: 16 }} />}
                                title="Target Role Matches"
                            />
                            <Button
                                size="small" variant="text"
                                onClick={() => navigate('/skills-gap')}
                                endIcon={<ArrowForwardIcon sx={{ fontSize: '12px !important' }} />}
                                sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textTransform: 'none', minHeight: 28, '&:hover': { color: '#fff' } }}
                            >
                                View Gaps
                            </Button>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            {aiPaths
                                ? aiPaths.map(p => (
                                    <RoleCard
                                        key={p.role}
                                        title={p.role}
                                        salary={p.salary_range ?? '$100k – $150k'}
                                        demand={p.match_percent >= 75 ? 'Very High' : 'High'}
                                        demandColor={p.match_percent >= 75 ? '#4ade80' : '#facc15'}
                                        skills={p.skills_needed ?? []}
                                        userSkills={userSkills}
                                        matchPct={p.match_percent}
                                    />
                                ))
                                : DEFAULT_ROLES.map(job => (
                                    <RoleCard
                                        key={job.title}
                                        title={job.title}
                                        salary={job.salary}
                                        demand={job.demand}
                                        demandColor={job.demandColor}
                                        skills={job.skills}
                                        userSkills={userSkills}
                                    />
                                ))
                            }
                        </Box>
                    </GlassCard>
                </Box>

                {/* Right — Roadmap */}
                <Box>
                    <GlassCard sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <TimelineOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
                                Learning Roadmap
                            </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mb: 2.5 }}>
                            Sequential milestones to reach your target role
                        </Typography>
                        <RoadmapStepList steps={roadmap} />

                        {roadmap.length > 0 && (
                            <>
                                <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.05)' }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontWeight: 600 }}>
                                        {roadmap.length} milestones · Est. 3–6 months
                                    </Typography>
                                    <Button
                                        size="small" variant="text"
                                        onClick={() => navigate('/skills-gap')}
                                        endIcon={<TrendingUpOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                                        sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', textTransform: 'none', '&:hover': { color: '#fff' } }}
                                    >
                                        Skill Gaps
                                    </Button>
                                </Box>
                            </>
                        )}
                    </GlassCard>
                </Box>
            </Box>
        </Box>
    );
}
