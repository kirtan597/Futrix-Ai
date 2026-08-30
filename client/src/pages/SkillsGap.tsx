import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import apiService from '../services/apiService';

interface AnalysisData {
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap: string[];
}

const PRIORITY: Record<string, { level: 'critical' | 'high' | 'medium'; course: string; effort: number; impact: number }> = {
    'Docker':     { level: 'critical', course: 'Docker Deep Dive on YouTube / Coursera', effort: 3, impact: 9 },
    'Kubernetes': { level: 'critical', course: 'Kubernetes for Beginners (KodeKloud)',   effort: 8, impact: 10 },
    'AWS':        { level: 'high',     course: 'AWS Certified Cloud Practitioner (A Cloud Guru)', effort: 5, impact: 9 },
    'TypeScript': { level: 'high',     course: 'TypeScript Fundamentals (Frontend Masters)', effort: 3, impact: 8 },
    'GraphQL':    { level: 'medium',   course: 'Full Stack GraphQL on Udemy', effort: 4, impact: 6 },
    'Redis':      { level: 'medium',   course: 'Redis University RU101', effort: 3, impact: 6 },
    'Go':         { level: 'medium',   course: 'Tour of Go (go.dev/tour)', effort: 6, impact: 7 },
    'CI/CD':      { level: 'high',     course: 'GitHub Actions Documentation & Tutorials', effort: 4, impact: 8 },
    'PostgreSQL': { level: 'medium',   course: 'PostgreSQL Tutorial (postgresqltutorial.com)', effort: 3, impact: 5 },
    'Java':       { level: 'high',     course: 'Java Brains Spring Boot Masterclass', effort: 7, impact: 8 },
    'Python':     { level: 'critical', course: 'Complete Python Bootcamp on Udemy', effort: 4, impact: 10 },
    'React':      { level: 'high',     course: 'Epic React by Kent C. Dodds', effort: 4, impact: 9 },
    'Git':        { level: 'high',     course: 'Pro Git Book (git-scm.com/book)', effort: 2, impact: 7 },
};

const LEVEL_STYLE = {
    critical: { color: 'rgba(248,113,113,0.85)', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', label: 'Critical' },
    high:     { color: 'rgba(251,191,36,0.85)',  bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',   label: 'High' },
    medium:   { color: 'rgba(148,163,184,0.7)',  bg: 'rgba(148,163,184,0.06)', border: 'rgba(148,163,184,0.15)', label: 'Medium' },
};

// ─── Pure SVG Skill Distribution Bar Chart (Guaranteed 100% Reliable Render) ─
function SkillDistributionBarChart({ barData }: { barData: { name: string; value: number; fill: string }[] }) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const W = 380;
    const H = 200;
    const PAD_L = 32;
    const PAD_R = 16;
    const PAD_T = 20;
    const PAD_B = 32;

    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    const maxVal = Math.max(1, ...barData.map(d => d.value));
    const yMax = Math.max(8, Math.ceil(maxVal / 4) * 4);

    const barWidth = 32;
    const slotW = plotW / barData.length;

    return (
        <Box sx={{ width: '100%', height: 200, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
                viewBox={`0 0 ${W} ${H}`}
                style={{ width: '100%', height: '100%', maxHeight: 200, overflow: 'visible' }}
                onMouseLeave={() => setHoveredIdx(null)}
            >
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1.0].map((pct, idx) => {
                    const y = PAD_T + (1 - pct) * plotH;
                    const val = Math.round(pct * yMax);
                    return (
                        <g key={idx}>
                            <line
                                x1={PAD_L}
                                y1={y}
                                x2={W - PAD_R}
                                y2={y}
                                stroke="rgba(255, 255, 255, 0.05)"
                                strokeDasharray="3 3"
                            />
                            <text
                                x={PAD_L - 6}
                                y={y + 3.5}
                                textAnchor="end"
                                fill="rgba(255, 255, 255, 0.25)"
                                fontSize={9.5}
                                fontFamily="Inter, sans-serif"
                            >
                                {val}
                            </text>
                        </g>
                    );
                })}

                {/* Bars */}
                {barData.map((d, i) => {
                    const barH = (d.value / yMax) * plotH;
                    const x = PAD_L + i * slotW + (slotW - barWidth) / 2;
                    const y = PAD_T + plotH - barH;
                    const isHovered = hoveredIdx === i;

                    return (
                        <g
                            key={d.name}
                            onMouseEnter={() => setHoveredIdx(i)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Bar Rect */}
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(4, barH)}
                                rx={6}
                                fill={d.fill}
                                fillOpacity={isHovered ? 1 : 0.85}
                                style={{ transition: 'all 0.2s ease' }}
                            />

                            {/* Value Label above Bar */}
                            <text
                                x={x + barWidth / 2}
                                y={y - 6}
                                textAnchor="middle"
                                fill={isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.7)'}
                                fontSize={10}
                                fontWeight={700}
                                fontFamily="Inter, sans-serif"
                            >
                                {d.value}
                            </text>

                            {/* X Axis Label */}
                            <text
                                x={x + barWidth / 2}
                                y={H - PAD_B + 16}
                                textAnchor="middle"
                                fill={isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
                                fontSize={10.5}
                                fontWeight={isHovered ? 700 : 500}
                                fontFamily="Inter, sans-serif"
                            >
                                {d.name}
                            </text>
                        </g>
                    );
                })}

                {/* Tooltip on Hover */}
                {hoveredIdx !== null && (
                    <g transform={`translate(${PAD_L + hoveredIdx * slotW + slotW / 2}, ${Math.max(14, PAD_T - 4)})`}>
                        <rect
                            x={-36}
                            y={-14}
                            width={72}
                            height={22}
                            rx={5}
                            fill="#1a1a1a"
                            stroke="rgba(255, 255, 255, 0.2)"
                            strokeWidth={1}
                        />
                        <text
                            x={0}
                            y={1}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={10}
                            fontWeight={700}
                            fontFamily="Inter, sans-serif"
                        >
                            {barData[hoveredIdx].value} Skills
                        </text>
                    </g>
                )}
            </svg>
        </Box>
    );
}

// ─── Priority Matrix (Collision-Free Interactive Scatter) ──────────────────────
function PriorityMatrix({ items }: { items: { skill: string; effort: number; impact: number; level: 'critical' | 'high' | 'medium' }[] }) {
    const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

    const W = 360;
    const H = 230;
    const PAD_L = 36;
    const PAD_R = 20;
    const PAD_T = 20;
    const PAD_B = 30;

    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    const toX = (v: number) => PAD_L + ((v - 1) / 9) * plotW;
    const toY = (v: number) => PAD_T + ((10 - v) / 9) * plotH;

    const activeItem = items.find(it => it.skill === hoveredSkill);

    return (
        <Box sx={{ position: 'relative', width: '100%', maxWidth: W, mx: 'auto' }}>
            <svg
                width="100%"
                viewBox={`0 0 ${W} ${H}`}
                style={{ overflow: 'visible' }}
                onMouseLeave={() => setHoveredSkill(null)}
            >
                {/* Quadrant backgrounds */}
                <rect x={PAD_L} y={PAD_T} width={plotW / 2} height={plotH / 2} fill="rgba(248,113,113,0.03)" />
                <rect x={PAD_L + plotW / 2} y={PAD_T} width={plotW / 2} height={plotH / 2} fill="rgba(251,191,36,0.03)" />
                <rect x={PAD_L} y={PAD_T + plotH / 2} width={plotW / 2} height={plotH / 2} fill="rgba(255,255,255,0.01)" />
                <rect x={PAD_L + plotW / 2} y={PAD_T + plotH / 2} width={plotW / 2} height={plotH / 2} fill="rgba(148,163,184,0.01)" />

                {/* Divider lines */}
                <line x1={PAD_L} y1={PAD_T + plotH / 2} x2={W - PAD_R} y2={PAD_T + plotH / 2} stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="3 3" />
                <line x1={PAD_L + plotW / 2} y1={PAD_T} x2={PAD_L + plotW / 2} y2={H - PAD_B} stroke="rgba(255,255,255,0.08)" strokeWidth={1} strokeDasharray="3 3" />

                {/* Outer Border */}
                <rect x={PAD_L} y={PAD_T} width={plotW} height={plotH} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={1} rx={4} />

                {/* Axis labels */}
                <text x={PAD_L + plotW / 2} y={H - 10} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="Inter,sans-serif">Effort Required →</text>
                <text x={12} y={PAD_T + plotH / 2} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={9} fontFamily="Inter,sans-serif" transform={`rotate(-90,12,${PAD_T + plotH / 2})`}>Impact →</text>

                {/* Quadrant Headings */}
                <text x={PAD_L + 8} y={PAD_T + 14} fill="rgba(248,113,113,0.55)" fontSize={7.5} fontFamily="Inter,sans-serif" fontWeight="700">HIGH IMPACT</text>
                <text x={PAD_L + plotW / 2 + 8} y={PAD_T + 14} fill="rgba(251,191,36,0.55)" fontSize={7.5} fontFamily="Inter,sans-serif" fontWeight="700">STRETCH</text>
                <text x={PAD_L + 8} y={H - PAD_B - 6} fill="rgba(255,255,255,0.2)" fontSize={7.5} fontFamily="Inter,sans-serif">QUICK WIN</text>
                <text x={PAD_L + plotW / 2 + 8} y={H - PAD_B - 6} fill="rgba(255,255,255,0.15)" fontSize={7.5} fontFamily="Inter,sans-serif">LOW PRIORITY</text>

                {/* Scatter Dots with Distinct Clean Badges */}
                {items.map(({ skill, effort, impact, level }, idx) => {
                    const cx = toX(effort);
                    const cy = toY(impact);
                    const col = LEVEL_STYLE[level].color;
                    const cleanName = skill.split('(')[0].trim();
                    const short = cleanName.length > 8 ? cleanName.slice(0, 7) + '.' : cleanName;
                    const isHovered = hoveredSkill === skill;

                    // Stagger label positions slightly to prevent collision when coords match
                    const labelOffsetY = idx % 2 === 0 ? -12 : 16;

                    return (
                        <g
                            key={skill}
                            onMouseEnter={() => setHoveredSkill(skill)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Hit area */}
                            <circle cx={cx} cy={cy} r={14} fill="transparent" />

                            {/* Glow circle */}
                            <circle
                                cx={cx}
                                cy={cy}
                                r={isHovered ? 9 : 7}
                                fill={col}
                                fillOpacity={isHovered ? 0.35 : 0.18}
                                stroke={col}
                                strokeWidth={1.5}
                                style={{ transition: 'all 0.15s ease' }}
                            />
                            <circle cx={cx} cy={cy} r={2.5} fill={col} />

                            {/* Short label */}
                            <text
                                x={cx}
                                y={cy + labelOffsetY}
                                textAnchor="middle"
                                fill={isHovered ? '#ffffff' : 'rgba(255,255,255,0.65)'}
                                fontSize={8}
                                fontFamily="Inter,sans-serif"
                                fontWeight={isHovered ? '700' : '600'}
                            >
                                {short}
                            </text>
                        </g>
                    );
                })}

                {/* Hover Tooltip Overlay */}
                {activeItem && (
                    <g transform={`translate(${Math.min(W - 80, Math.max(80, toX(activeItem.effort)))}, ${Math.max(20, toY(activeItem.impact) - 30)})`}>
                        <rect
                            x={-55}
                            y={-18}
                            width={110}
                            height={28}
                            rx={6}
                            fill="#141414"
                            stroke={LEVEL_STYLE[activeItem.level].color}
                            strokeWidth={1}
                        />
                        <text
                            x={0}
                            y={-4}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={9}
                            fontWeight="700"
                            fontFamily="Inter,sans-serif"
                        >
                            {activeItem.skill}
                        </text>
                        <text
                            x={0}
                            y={6}
                            textAnchor="middle"
                            fill={LEVEL_STYLE[activeItem.level].color}
                            fontSize={8}
                            fontFamily="Inter,sans-serif"
                        >
                            Impact: {activeItem.impact}/10 · Effort: {activeItem.effort}/10
                        </text>
                    </g>
                )}
            </svg>
        </Box>
    );
}

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
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.7 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: style.color, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skill}</Typography>
                    <Chip label={style.label} size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, background: style.bg, color: style.color, border: `1px solid ${style.border}`, px: 0.3, flexShrink: 0 }} />
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0, ml: 1, display: { xs: 'none', sm: 'block' }, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course}</Typography>
            </Box>
            <Box sx={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <Box ref={barRef} sx={{ height: '100%', borderRadius: 99, background: style.color, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </Box>
        </Box>
    );
}

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box sx={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '18px',
            transition: 'all 0.25s ease',
            ...sx
        }}>
            {children}
        </Box>
    );
}

export default function SkillsGap() {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const loadAnalysis = async () => {
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
                console.error('[SkillsGap] Failed to fetch history:', err);
            } finally {
                setMounted(true);
            }
        };

        loadAnalysis();
    }, []);

    if (!data) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, background: '#0a0a0a' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)' }}>No data. Upload a resume first.</Typography>
                <Button variant="outlined" onClick={() => navigate('/upload')} size="small">Upload</Button>
            </Box>
        );
    }

    const categorized = (data.gap_skills || []).map(g => {
        const clean = g.split('(')[0].trim();
        const conf = PRIORITY[clean]
            || Object.entries(PRIORITY).find(([k]) => clean.toLowerCase().includes(k.toLowerCase()))?.[1]
            || { level: 'medium' as const, course: `Search "${clean}" on YouTube`, effort: 4, impact: 6 };
        return {
            skill: g,
            info: conf,
        };
    });

    const critical = categorized.filter(x => x.info.level === 'critical');
    const high     = categorized.filter(x => x.info.level === 'high');
    const medium   = categorized.filter(x => x.info.level === 'medium');

    // Bar chart data
    const barData = [
        { name: 'Have',     value: (data.skills || []).length, fill: 'rgba(255,255,255,0.85)' },
        { name: 'Critical', value: critical.length,            fill: 'rgba(248,113,113,0.85)' },
        { name: 'High',     value: high.length,                fill: 'rgba(251,191,36,0.85)' },
        { name: 'Medium',   value: medium.length,              fill: 'rgba(148,163,184,0.7)' },
    ];

    // Gap pct per skill (impact score as %)
    const arcItems = categorized.map(c => ({
        skill: c.skill,
        level: c.info.level,
        pct: (c.info.impact / 10) * 100,
        course: c.info.course,
    })).sort((a, b) => b.pct - a.pct);

    const matrixItems = categorized.map(c => ({ skill: c.skill, effort: c.info.effort, impact: c.info.impact, level: c.info.level }));
    const totalSkills = (data.skills || []).length + (data.gap_skills || []).length;
    const coveragePct = totalSkills ? Math.round(((data.skills || []).length / totalSkills) * 100) : 0;

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
                    { label: 'Skills You Have',  value: (data.skills || []).length, color: 'rgba(255,255,255,0.9)',    icon: <CheckCircleOutlineIcon sx={{ fontSize: 18 }} /> },
                    { label: 'Critical Gaps',    value: critical.length,             color: 'rgba(248,113,113,0.85)',   icon: <WarningAmberOutlinedIcon sx={{ fontSize: 18 }} /> },
                    { label: 'High Priority',    value: high.length,                 color: 'rgba(251,191,36,0.85)',    icon: <TrendingUpOutlinedIcon sx={{ fontSize: 18 }} /> },
                    { label: 'Coverage',         value: `${coveragePct}%`,           color: 'rgba(148,163,184,0.9)',    icon: <SchoolOutlinedIcon sx={{ fontSize: 18 }} /> },
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
                    <SkillDistributionBarChart barData={barData} />
                </GlassCard>

                {/* Priority Matrix */}
                <GlassCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <SchoolOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Impact vs Effort Matrix</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mb: 2 }}>
                        Prioritize which gaps to close first (hover point to inspect)
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <PriorityMatrix items={matrixItems} />
                    </Box>
                    {/* Legend */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2.5, mt: 1.5, flexWrap: 'wrap' }}>
                        {(['critical', 'high', 'medium'] as const).map(l => (
                            <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: LEVEL_STYLE[l].color }} />
                                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{LEVEL_STYLE[l].label}</Typography>
                            </Box>
                        ))}
                    </Box>
                </GlassCard>
            </Box>

            {/* ── ROW 3: Gap Severity Index ── */}
            <GlassCard sx={{ p: { xs: 2.5, md: 3.5 }, mb: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.15s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Gap Severity Index</Typography>
                    </Box>
                    <Chip label="Ranked by Impact" size="small" sx={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.72rem' }} />
                </Box>
                <Divider sx={{ mb: 2.5 }} />
                {arcItems.length === 0 ? (
                    <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem', textAlign: 'center', py: 2 }}>
                        No significant skill gaps detected.
                    </Typography>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 1.5, md: '0 40px' } }}>
                        {arcItems.map(item => <ArcBar key={item.skill} {...item} />)}
                    </Box>
                )}
            </GlassCard>

            {/* ── ROW 4: Skills you have ── */}
            <GlassCard sx={{ p: { xs: 2.5, md: 3.5 }, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.2s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Verified Capabilities</Typography>
                    </Box>
                    <Chip label={`${data.skills.length} Detected`} size="small" sx={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.72rem' }} />
                </Box>
                <Divider sx={{ mb: 2.5 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
                    {data.skills.map((s, i) => (
                        <Box key={s} sx={{
                            px: 1.5, py: 0.55,
                            borderRadius: '7px',
                            fontSize: '0.77rem', fontWeight: 600,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.7)',
                            cursor: 'default',
                            transition: 'all 0.18s',
                            animation: `fadeUp 0.4s ease both`,
                            animationDelay: `${i * 0.025}s`,
                            '&:hover': {
                                background: 'rgba(255,255,255,0.08)',
                                borderColor: 'rgba(255,255,255,0.18)',
                                color: '#fff',
                                transform: 'translateY(-1px)',
                            },
                        }}>
                            {s}
                        </Box>
                    ))}
                </Box>
            </GlassCard>
        </Box>
    );
}
