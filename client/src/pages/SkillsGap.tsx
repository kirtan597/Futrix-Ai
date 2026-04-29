import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

interface AnalysisData {
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap: string[];
}

const PRIORITY: Record<string, { level: 'critical' | 'high' | 'medium'; course: string; effort: number; impact: number }> = {
    'Docker':     { level: 'critical', course: 'Docker Deep Dive — Udemy',           effort: 3, impact: 9 },
    'Kubernetes': { level: 'critical', course: 'Kubernetes for Beginners — KodeKloud', effort: 8, impact: 10 },
    'AWS':        { level: 'high',     course: 'AWS Cloud Practitioner — AWS Training', effort: 5, impact: 9 },
    'TypeScript': { level: 'high',     course: 'TypeScript Full Course — FreeCodeCamp', effort: 3, impact: 8 },
    'GraphQL':    { level: 'medium',   course: 'Full Stack GQL — Odyssey Apollo',       effort: 4, impact: 6 },
    'Redis':      { level: 'medium',   course: 'Redis University — Free Course',        effort: 3, impact: 6 },
    'Go':         { level: 'medium',   course: 'Tour of Go — go.dev',                  effort: 6, impact: 7 },
    'CI/CD':      { level: 'high',     course: 'GitHub Actions — GitHub Learning Lab',  effort: 4, impact: 8 },
    'PostgreSQL': { level: 'medium',   course: 'PostgreSQL Tutorial — PostgreSQL.org',  effort: 3, impact: 5 },
    'Java':       { level: 'high',     course: 'Java Masterclass — Udemy',             effort: 7, impact: 8 },
};

const LEVEL_STYLE = {
    critical: { color: 'rgba(248,113,113,0.85)', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)',  label: 'Critical' },
    high:     { color: 'rgba(251,191,36,0.85)',  bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',   label: 'High' },
    medium:   { color: 'rgba(148,163,184,0.7)',  bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.15)', label: 'Medium' },
};

// ─── Animated Arc Bar ─────────────────────────────────────────────────────────
function ArcBar({ skill, level, pct, course }: { skill: string; level: 'critical'|'high'|'medium'; pct: number; course: string }) {
    const style = LEVEL_STYLE[level];
    const barRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = barRef.current; if (!el) return;
        el.style.width = '0%';
        const t = setTimeout(() => { el.style.width = `${pct}%`; }, 100);
        return () => clearTimeout(t);
    }, [pct]);

    return (
        <Box sx={{ mb: 1.8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.7 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: style.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{skill}</Typography>
                    <Chip label={style.label} size="small" sx={{ height: 16, fontSize: '0.6rem', fontWeight: 700, background: style.bg, color: style.color, border: `1px solid ${style.border}`, px: 0.3 }} />
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{course}</Typography>
            </Box>
            <Box sx={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <Box ref={barRef} sx={{ height: '100%', borderRadius: 99, background: style.color, transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)', boxShadow: `0 0 8px ${style.color}` }} />
            </Box>
        </Box>
    );
}

// ─── Priority Matrix (2×2 SVG quadrant) ──────────────────────────────────────
function PriorityMatrix({ items }: { items: { skill: string; effort: number; impact: number; level: 'critical'|'high'|'medium' }[] }) {
    const W = 320, H = 240, PAD = 36;
    const toX = (v: number) => PAD + ((v - 1) / 9) * (W - PAD * 2);
    const toY = (v: number) => H - PAD - ((v - 1) / 9) * (H - PAD * 2);

    return (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: W }}>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
                {/* Quadrant bg */}
                <rect x={PAD} y={PAD} width={(W - PAD*2)/2} height={(H - PAD*2)/2} fill="rgba(248,113,113,0.03)" />
                <rect x={PAD + (W-PAD*2)/2} y={PAD} width={(W-PAD*2)/2} height={(H-PAD*2)/2} fill="rgba(251,191,36,0.03)" />
                <rect x={PAD} y={PAD+(H-PAD*2)/2} width={(W-PAD*2)/2} height={(H-PAD*2)/2} fill="rgba(255,255,255,0.015)" />
                <rect x={PAD+(W-PAD*2)/2} y={PAD+(H-PAD*2)/2} width={(W-PAD*2)/2} height={(H-PAD*2)/2} fill="rgba(148,163,184,0.02)" />
                {/* Axis lines */}
                <line x1={PAD} y1={H/2} x2={W-PAD} y2={H/2} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="4 4" />
                <line x1={W/2} y1={PAD} x2={W/2} y2={H-PAD} stroke="rgba(255,255,255,0.06)" strokeWidth={1} strokeDasharray="4 4" />
                {/* Border */}
                <rect x={PAD} y={PAD} width={W-PAD*2} height={H-PAD*2} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
                {/* Axis labels */}
                <text x={W/2} y={H-6} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={9} fontFamily="Inter,sans-serif">Effort →</text>
                <text x={8} y={H/2} textAnchor="middle" fill="rgba(255,255,255,0.25)" fontSize={9} fontFamily="Inter,sans-serif" transform={`rotate(-90,8,${H/2})`}>Impact →</text>
                {/* Quadrant labels */}
                <text x={PAD+8} y={PAD+14} fill="rgba(248,113,113,0.5)" fontSize={8} fontFamily="Inter,sans-serif" fontWeight="700">HIGH IMPACT</text>
                <text x={W/2+6} y={PAD+14} fill="rgba(251,191,36,0.5)" fontSize={8} fontFamily="Inter,sans-serif" fontWeight="700">STRETCH</text>
                <text x={PAD+8} y={H-PAD+12} fill="rgba(255,255,255,0.2)" fontSize={8} fontFamily="Inter,sans-serif">QUICK WIN</text>
                <text x={W/2+6} y={H-PAD+12} fill="rgba(255,255,255,0.15)" fontSize={8} fontFamily="Inter,sans-serif">LOW PRIORITY</text>
                {/* Dots */}
                {items.map(({ skill, effort, impact, level }) => {
                    const cx = toX(effort), cy = toY(impact);
                    const col = LEVEL_STYLE[level].color;
                    const short = skill.length > 8 ? skill.slice(0,7)+'.' : skill;
                    return (
                        <g key={skill}>
                            <circle cx={cx} cy={cy} r={7} fill={col} fillOpacity={0.18} stroke={col} strokeWidth={1.5} />
                            <circle cx={cx} cy={cy} r={2.5} fill={col} />
                            <text x={cx} y={cy - 11} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={8} fontFamily="Inter,sans-serif">{short}</text>
                        </g>
                    );
                })}
            </svg>
        </Box>
    );
}

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return <Box sx={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: '18px', ...sx }}>{children}</Box>;
}

export default function SkillsGap() {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('analysisResult');
        if (stored) { try { setData(JSON.parse(stored)); } catch { /* */ } }
        setTimeout(() => setMounted(true), 80);
    }, []);

    if (!data) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, background: '#0a0a0a' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>No data. Upload a resume first.</Typography>
                <Button variant="outlined" onClick={() => navigate('/upload')} size="small">Upload</Button>
            </Box>
        );
    }

    const categorized = data.gap_skills.map(g => ({
        skill: g,
        info: PRIORITY[g] ?? { level: 'medium' as const, course: `Search "${g}" on YouTube`, effort: 4, impact: 5 },
    }));

    const critical = categorized.filter(x => x.info.level === 'critical');
    const high     = categorized.filter(x => x.info.level === 'high');
    const medium   = categorized.filter(x => x.info.level === 'medium');

    // Bar chart data: skills have vs gaps
    const barData = [
        { name: 'Have', value: data.skills.length,     fill: 'rgba(255,255,255,0.7)' },
        { name: 'Critical', value: critical.length,    fill: 'rgba(248,113,113,0.7)' },
        { name: 'High',     value: high.length,        fill: 'rgba(251,191,36,0.7)' },
        { name: 'Medium',   value: medium.length,      fill: 'rgba(148,163,184,0.6)' },
    ];

    // Gap pct per skill (impact score as %)
    const arcItems = categorized.map(c => ({
        skill: c.skill,
        level: c.info.level,
        pct: (c.info.impact / 10) * 100,
        course: c.info.course,
    })).sort((a, b) => b.pct - a.pct);

    const matrixItems = categorized.map(c => ({ skill: c.skill, effort: c.info.effort, impact: c.info.impact, level: c.info.level }));
    const totalSkills = data.skills.length + data.gap_skills.length;
    const coveragePct = totalSkills ? Math.round((data.skills.length / totalSkills) * 100) : 0;

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>

            {/* Header */}
            <Box sx={{ mb: 4, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                    Gap Intelligence
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', mb: 0.8, fontSize: { xs: '1.6rem', md: '2.125rem' } }}>
                    Skills Gap Analysis
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>
                    Priority-ranked gaps with impact vs effort matrix and learning resources
                </Typography>
            </Box>

            {/* ── ROW 1: 4 stat cards ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.05s' }}>
                {[
                    { label: 'Skills You Have',  value: data.skills.length,   color: 'rgba(255,255,255,0.9)',    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18 }} /> },
                    { label: 'Critical Gaps',    value: critical.length,       color: 'rgba(248,113,113,0.85)',   icon: <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} /> },
                    { label: 'High Priority',    value: high.length,           color: 'rgba(251,191,36,0.85)',    icon: <TrendingUpOutlinedIcon sx={{ fontSize: 18 }} /> },
                    { label: 'Coverage',         value: `${coveragePct}%`,     color: 'rgba(148,163,184,0.9)',    icon: <SchoolOutlinedIcon sx={{ fontSize: 18 }} /> },
                ].map(({ label, value, color, icon }) => (
                    <GlassCard key={label} sx={{ p: { xs: 2, md: 2.5 } }}>
                        <Box sx={{ color: 'rgba(255,255,255,0.25)', mb: 1.5, display: 'flex' }}>{icon}</Box>
                        <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 900, color, letterSpacing: '-0.06em', lineHeight: 1, mb: 0.5 }}>
                            {value}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</Typography>
                    </GlassCard>
                ))}
            </Box>

            {/* ── ROW 2: Bar chart + Priority Matrix ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.1s' }}>

                {/* Bar chart */}
                <GlassCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <TrendingUpOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Skill Distribution</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mb: 2.5 }}>
                        Breakdown of your skill profile by priority
                    </Typography>
                    <Box sx={{ height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={32}>
                                <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                                    contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontSize: 12 }}
                                    formatter={(v: unknown) => [String(v ?? ''), 'Skills'] as [string, string]}
                                />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                    {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                </GlassCard>

                {/* Priority Matrix */}
                <GlassCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <SchoolOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Impact vs Effort Matrix</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mb: 2 }}>
                        Prioritize which gaps to close first
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <PriorityMatrix items={matrixItems} />
                    </Box>
                    {/* Legend */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 1.5 }}>
                        {Object.entries(LEVEL_STYLE).map(([k, v]) => (
                            <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />
                                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{v.label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </GlassCard>
            </Box>

            {/* ── ROW 3: Animated Gap Bars ── */}
            <GlassCard sx={{ p: 3.5, mb: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.15s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <WarningAmberOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Gap Severity Index</Typography>
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mb: 2.5 }}>
                    Ranked by career impact — wider bar = higher career value
                </Typography>
                <Divider sx={{ mb: 2.5 }} />
                {arcItems.length === 0 ? (
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', py: 2 }}>
                        No skill gaps detected — excellent coverage!
                    </Typography>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 0, md: '0 48px' } }}>
                        {arcItems.map(item => <ArcBar key={item.skill} {...item} />)}
                    </Box>
                )}
            </GlassCard>

            {/* ── ROW 4: Skills you already have ── */}
            <GlassCard sx={{ p: 3.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.2s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Skills You Already Have</Typography>
                    <Chip label={data.skills.length} size="small" sx={{ ml: 'auto', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 700, fontSize: '0.72rem' }} />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
                    {data.skills.map((s, i) => (
                        <Box key={s} sx={{
                            px: 1.5, py: 0.55, borderRadius: '8px', fontSize: '0.77rem', fontWeight: 600,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.65)', cursor: 'default',
                            animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.025}s`,
                            transition: 'all 0.18s',
                            '&:hover': { background: 'rgba(255,255,255,0.1)', color: '#fff', transform: 'translateY(-1px)' },
                        }}>
                            {s}
                        </Box>
                    ))}
                </Box>
            </GlassCard>
        </Box>
    );
}
