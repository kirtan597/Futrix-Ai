import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';

const MOCK_HISTORY = [
    { id: 1, date: '2026-04-10', skills: ['React','TypeScript','Node.js','Python','MongoDB','Docker','Git','REST API'], gap_skills: ['Kubernetes','AWS','GraphQL','Redis','Go'], readiness_score: 72, roadmap_steps: 5 },
    { id: 2, date: '2026-03-22', skills: ['React','JavaScript','Node.js','Git','REST API'], gap_skills: ['TypeScript','Docker','MongoDB','Kubernetes','AWS','GraphQL','Redis'], readiness_score: 54, roadmap_steps: 7 },
    { id: 3, date: '2026-02-14', skills: ['React','JavaScript','Git'], gap_skills: ['TypeScript','Node.js','MongoDB','Docker','Kubernetes','AWS','GraphQL','Redis','Go'], readiness_score: 38, roadmap_steps: 9 },
];

// Thin separator with zero background — replaces MUI Divider which bleeds white
function Sep() {
    return <Box sx={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.06)', my: 2, flexShrink: 0 }} />;
}

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box sx={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.065)',
            borderRadius: '18px',
            ...sx,
        }}>
            {children}
        </Box>
    );
}

// ─── Mini Score Ring ──────────────────────────────────────────────────────────
function MiniRing({ score, size = 56 }: { score: number; size?: number }) {
    const sw = 5, r = (size / 2) - sw;
    const circ = 2 * Math.PI * r;
    const offset = ((100 - score) / 100) * circ;
    const color = score >= 70 ? '#e5e5e5' : score >= 50 ? '#a3a3a3' : '#525252';
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block', overflow: 'visible' }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw} />
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
            </svg>
            <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color, lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {score}
                </Typography>
            </Box>
        </Box>
    );
}

export default function History() {
    const [mounted, setMounted] = useState(false);
    const [real, setReal] = useState<typeof MOCK_HISTORY[0] | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('analysisResult');
        if (stored) {
            try {
                const d = JSON.parse(stored);
                setReal({
                    id: 0,
                    date: new Date().toISOString().split('T')[0],
                    skills: d.skills,
                    gap_skills: d.gap_skills,
                    readiness_score: d.readiness_score,
                    roadmap_steps: d.roadmap?.length ?? 0,
                });
            } catch { /* */ }
        }
        setTimeout(() => setMounted(true), 80);
    }, []);

    const history = real ? [real, ...MOCK_HISTORY] : MOCK_HISTORY;

    const chartData = [...history].reverse().map((h, i) => ({
        label: i === history.length - 1 && real ? 'Now' : h.date.slice(5),
        score: h.readiness_score,
    }));

    const best = Math.max(...history.map(h => h.readiness_score));
    const totalGrowth = history.length > 1
        ? history[0].readiness_score - history[history.length - 1].readiness_score
        : 0;

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>

            {/* ── Header ── */}
            <Box sx={{ mb: 4, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                    Analysis History
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', mb: 0.8, fontSize: { xs: '1.6rem', md: '2.125rem' } }}>
                    Past Analyses
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>
                    Track your career readiness progress over time
                </Typography>
            </Box>

            {/* ── Stat strip ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.04s' }}>
                {[
                    { label: 'Analyses Run',  value: history.length,                   color: 'rgba(255,255,255,0.9)' },
                    { label: 'Best Score',    value: best,                              color: '#e5e5e5' },
                    { label: 'Latest Score',  value: history[0].readiness_score,        color: 'rgba(255,255,255,0.8)' },
                    { label: 'Total Growth',  value: `${totalGrowth > 0 ? '+' : ''}${totalGrowth} pts`, color: totalGrowth >= 0 ? 'rgba(134,239,172,0.85)' : 'rgba(248,113,113,0.85)' },
                ].map(({ label, value, color }) => (
                    <GlassCard key={label} sx={{ p: { xs: 2, md: 2.5 } }}>
                        <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 900, color, letterSpacing: '-0.06em', lineHeight: 1, mb: 0.5 }}>
                            {value}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                            {label}
                        </Typography>
                    </GlassCard>
                ))}
            </Box>

            {/* ── Score Progression Chart ── */}
            <GlassCard sx={{ p: 3.5, mb: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.08s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <TrendingUpOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
                        Readiness Score Over Time
                    </Typography>
                    <Chip
                        label={totalGrowth >= 0 ? `↑ +${totalGrowth} pts` : `↓ ${totalGrowth} pts`}
                        size="small"
                        sx={{
                            ml: 'auto', height: 20, fontSize: '0.68rem', fontWeight: 700,
                            background: totalGrowth >= 0 ? 'rgba(134,239,172,0.08)' : 'rgba(248,113,113,0.08)',
                            color: totalGrowth >= 0 ? 'rgba(134,239,172,0.85)' : 'rgba(248,113,113,0.85)',
                            border: `1px solid ${totalGrowth >= 0 ? 'rgba(134,239,172,0.2)' : 'rgba(248,113,113,0.2)'}`,
                        }}
                    />
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mb: 3 }}>
                    Score trajectory across all your analyses
                </Typography>

                {/* Isolated chart container — explicit overflow:hidden stops gradient bleed */}
                <Box sx={{ height: 200, overflow: 'hidden', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%"   stopColor="#ffffff" stopOpacity={0.12} />
                                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0}    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <ReferenceLine
                                y={60}
                                stroke="rgba(255,255,255,0.07)"
                                strokeDasharray="4 4"
                                label={{ value: 'Target', fill: 'rgba(255,255,255,0.18)', fontSize: 10 }}
                            />
                            <Tooltip
                                cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
                                wrapperStyle={{ outline: 'none' }}
                                formatter={(v: unknown) => [`${v}/100`, 'Score']}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="rgba(255,255,255,0.6)"
                                strokeWidth={2}
                                fill="url(#histGrad)"
                                dot={{ fill: '#ffffff', r: 3, strokeWidth: 0 }}
                                activeDot={{ fill: '#ffffff', r: 5, strokeWidth: 0 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Box>
            </GlassCard>

            {/* ── Timeline ── */}
            <Box sx={{ position: 'relative', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.12s' }}>

                {history.map((h, i) => {
                    const isLatest = i === 0;
                    const prev = history[i + 1];
                    const delta = prev ? h.readiness_score - prev.readiness_score : null;
                    const date = new Date(h.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

                    return (
                        <Box
                            key={h.id}
                            sx={{ display: 'flex', gap: { xs: 1.5, md: 2.5 }, mb: 2, animation: 'fadeUp 0.4s ease both', animationDelay: `${i * 0.07}s` }}
                        >
                            {/* Score ring node — desktop only */}
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'center', flexShrink: 0, pt: 1 }}>
                                <MiniRing score={h.readiness_score} size={isLatest ? 58 : 50} />
                            </Box>

                            {/* Card */}
                            <GlassCard sx={{
                                flex: 1,
                                p: { xs: 2.5, md: 3 },
                                borderColor: isLatest ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.055)',
                                transition: 'all 0.25s',
                                '&:hover': {
                                    borderColor: 'rgba(255,255,255,0.14)',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                                    transform: 'translateY(-2px)',
                                },
                            }}>
                                {/* Card header row */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                                            <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.28)' }} />
                                            <Typography sx={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>{date}</Typography>
                                            {isLatest && (
                                                <Chip label="Latest" size="small" sx={{ height: 17, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} />
                                            )}
                                        </Box>
                                        <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>
                                            Analysis #{history.length - i}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        {/* Score ring on mobile */}
                                        <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                                            <MiniRing score={h.readiness_score} size={50} />
                                        </Box>
                                        {/* Delta badge */}
                                        {delta !== null && (
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, justifyContent: 'flex-end' }}>
                                                    {delta >= 0
                                                        ? <TrendingUpOutlinedIcon sx={{ fontSize: 13, color: 'rgba(134,239,172,0.7)' }} />
                                                        : <TrendingDownOutlinedIcon sx={{ fontSize: 13, color: 'rgba(248,113,113,0.7)' }} />
                                                    }
                                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: delta >= 0 ? 'rgba(134,239,172,0.7)' : 'rgba(248,113,113,0.7)' }}>
                                                        {delta > 0 ? '+' : ''}{delta} pts
                                                    </Typography>
                                                </Box>
                                                <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.22)' }}>vs prev</Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                {/* ── Thin separator — no MUI Divider ── */}
                                <Sep />

                                {/* Score bar */}
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.7 }}>
                                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)' }}>Readiness Score</Typography>
                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>{h.readiness_score}/100</Typography>
                                    </Box>
                                    <Box sx={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                        <Box sx={{
                                            height: '100%', borderRadius: 99,
                                            width: `${h.readiness_score}%`,
                                            background: h.readiness_score >= 70 ? 'rgba(255,255,255,0.65)' : h.readiness_score >= 50 ? 'rgba(163,163,163,0.65)' : 'rgba(82,82,82,0.65)',
                                            transition: 'width 1s ease',
                                        }} />
                                    </Box>
                                </Box>

                                {/* Skills / Gaps / Roadmap */}
                                <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, flexWrap: 'wrap' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.22)', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                                            Skills ({h.skills.length})
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {h.skills.slice(0, 5).map(s => (
                                                <Chip key={s} label={s} size="small" sx={{ height: 20, fontSize: '0.67rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }} />
                                            ))}
                                            {h.skills.length > 5 && (
                                                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', alignSelf: 'center' }}>+{h.skills.length - 5}</Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.22)', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                                            Gaps ({h.gap_skills.length})
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {h.gap_skills.slice(0, 4).map(g => (
                                                <Chip key={g} label={g} size="small" sx={{ height: 20, fontSize: '0.67rem', fontWeight: 600, background: 'transparent', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }} />
                                            ))}
                                            {h.gap_skills.length > 4 && (
                                                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', alignSelf: 'center' }}>+{h.gap_skills.length - 4}</Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.22)', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                                            Roadmap
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>
                                            {h.roadmap_steps} steps
                                        </Typography>
                                    </Box>
                                </Box>
                            </GlassCard>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
