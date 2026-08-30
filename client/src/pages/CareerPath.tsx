import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import BarChartIcon from '@mui/icons-material/BarChart';
import apiService from '../services/apiService';

const DEFAULT_ROLES = [
    { title: 'Full Stack Engineer',    salary: '$95k–$155k', demand: 'Very High', skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'] },
    { title: 'Backend Cloud Architect', salary: '$120k–$175k', demand: 'High',      skills: ['Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'] },
    { title: 'AI / ML Engineer',        salary: '$130k–$190k', demand: 'Very High', skills: ['Python', 'Machine Learning', 'FastAPI', 'Docker', 'PyTorch'] },
    { title: 'Frontend Specialist',     salary: '$90k–$140k', demand: 'High',      skills: ['React', 'TypeScript', 'Next.js', 'CSS', 'Tailwind'] },
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

// ─── Mini Score Ring ──────────────────────────────────────────────────────────
function MiniRing({ pct, size = 56 }: { pct: number; size?: number }) {
    const sw = 4.5, r = (size / 2) - sw;
    const circ = 2 * Math.PI * r;
    const offset = ((100 - pct) / 100) * circ;
    const color = pct >= 75 ? 'rgba(255,255,255,0.95)' : pct >= 50 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)';

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
                <circle
                    cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
            </svg>
            <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 900, color, lineHeight: 1 }}>{pct}%</Typography>
            </Box>
        </Box>
    );
}

// ─── SVG Learning Roadmap Flowchart ───────────────────────────────────────────
function RoadmapFlow({ steps }: { steps: string[] }) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    if (!steps.length) return null;

    const NODE_W = 260, NODE_H = 58, GAP_Y = 26, PX = 20;
    const totalH = steps.length * (NODE_H + GAP_Y) - GAP_Y + PX * 2;
    const cx = NODE_W / 2 + PX;

    return (
        <Box sx={{ width: '100%', overflowX: 'auto', py: 1 }}>
            <svg width={NODE_W + PX * 2} height={totalH} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="flowNodeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                    </linearGradient>
                    <linearGradient id="flowActiveGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
                    </linearGradient>
                </defs>

                {steps.map((step, i) => {
                    const y = PX + i * (NODE_H + GAP_Y);
                    const isLast = i === steps.length - 1;
                    const lineY1 = y + NODE_H, lineY2 = y + NODE_H + GAP_Y;
                    const label = step.length > 28 ? step.slice(0, 27) + '...' : step;
                    const isFirst = i === 0;
                    const isHovered = hoveredIdx === i;

                    return (
                        <g
                            key={i}
                            onMouseEnter={() => setHoveredIdx(i)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        >
                            {/* Connector line */}
                            {!isLast && (
                                <g>
                                    <line
                                        x1={cx} y1={lineY1} x2={cx} y2={lineY2}
                                        stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} strokeDasharray="4 4"
                                    />
                                    <polygon
                                        points={`${cx},${lineY2} ${cx-4},${lineY2-6} ${cx+4},${lineY2-6}`}
                                        fill="rgba(255,255,255,0.3)"
                                    />
                                </g>
                            )}

                            {/* Node rectangle */}
                            <rect
                                x={PX} y={y} width={NODE_W} height={NODE_H} rx={12} ry={12}
                                fill={isFirst || isHovered ? 'url(#flowActiveGrad)' : 'url(#flowNodeGrad)'}
                                stroke={isFirst || isHovered ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.08)'}
                                strokeWidth={isHovered ? 1.5 : 1}
                                style={{ transition: 'all 0.2s ease' }}
                            />

                            {/* Step number badge */}
                            <rect
                                x={PX + 12} y={y + 16} width={26} height={26} rx={7}
                                fill={isFirst ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)'}
                            />
                            <text
                                x={PX + 25} y={y + 33}
                                textAnchor="middle"
                                fill={isFirst ? '#ffffff' : 'rgba(255,255,255,0.5)'}
                                fontSize={10} fontWeight="800" fontFamily="Inter,sans-serif"
                            >
                                {String(i + 1).padStart(2, '0')}
                            </text>

                            {/* Label */}
                            <text
                                x={PX + 48} y={y + NODE_H / 2 + 4}
                                fill={isFirst || isHovered ? '#ffffff' : 'rgba(255,255,255,0.7)'}
                                fontSize={11} fontWeight={isFirst ? '700' : '500'} fontFamily="Inter,sans-serif"
                            >
                                {label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </Box>
    );
}

// ─── Pure SVG Role Comparison Bar Chart ───────────────────────────────────────
function RoleComparisonChart({ roles }: { roles: { role: string; fit: number }[] }) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const W = 460;
    const H = roles.length * 36 + 24;
    const PAD_L = 140;
    const PAD_R = 50;
    const plotW = W - PAD_L - PAD_R;

    return (
        <Box sx={{ width: '100%', py: 1 }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }} onMouseLeave={() => setHoveredIdx(null)}>
                {roles.map((r, i) => {
                    const y = 14 + i * 36;
                    const barW = (r.fit / 100) * plotW;
                    const isHovered = hoveredIdx === i;

                    return (
                        <g
                            key={r.role}
                            onMouseEnter={() => setHoveredIdx(i)}
                            style={{ cursor: 'pointer' }}
                        >
                            {/* Role Label */}
                            <text
                                x={PAD_L - 10}
                                y={y + 13}
                                textAnchor="end"
                                fill={isHovered ? '#ffffff' : 'rgba(255,255,255,0.7)'}
                                fontSize={10.5}
                                fontWeight={isHovered ? 800 : 600}
                                fontFamily="Inter, sans-serif"
                            >
                                {r.role.length > 18 ? r.role.slice(0, 17) + '..' : r.role}
                            </text>

                            {/* Background Track */}
                            <rect
                                x={PAD_L}
                                y={y}
                                width={plotW}
                                height={18}
                                rx={6}
                                fill="rgba(255,255,255,0.04)"
                            />

                            {/* Fill Bar */}
                            <rect
                                x={PAD_L}
                                y={y}
                                width={barW}
                                height={18}
                                rx={6}
                                fill={isHovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.65)'}
                                style={{ transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            />

                            {/* Fit % Label */}
                            <text
                                x={PAD_L + barW + 8}
                                y={y + 13}
                                fill={isHovered ? '#ffffff' : 'rgba(255,255,255,0.5)'}
                                fontSize={10.5}
                                fontWeight={700}
                                fontFamily="Inter, sans-serif"
                            >
                                {r.fit}%
                            </text>
                        </g>
                    );
                })}
            </svg>
        </Box>
    );
}

// ─── Role Card ────────────────────────────────────────────────────────────────
function RoleCard({ title, salary, demand, skills, userSkills }: { title: string; salary: string; demand: string; skills: string[]; userSkills: string[] }) {
    const matched = skills.filter(s => userSkills.some(u => u.toLowerCase() === s.toLowerCase()));
    const pct = Math.round((matched.length / skills.length) * 100);

    return (
        <GlassCard sx={{
            p: 2.5, transition: 'all 0.25s',
            '&:hover': { borderColor: 'rgba(255,255,255,0.18)', transform: 'translateY(-3px)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' },
        }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                    <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem', mb: 0.4 }}>{title}</Typography>
                    <Typography sx={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)' }}>{salary}</Typography>
                </Box>
                <MiniRing pct={pct} />
            </Box>
            <Chip
                label={`${demand} demand`}
                size="small"
                sx={{
                    mb: 1.5, height: 18, fontSize: '0.62rem', fontWeight: 700,
                    background: demand === 'Very High' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    color: demand === 'Very High' ? '#fff' : 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                {skills.map(s => {
                    const has = userSkills.some(u => u.toLowerCase() === s.toLowerCase());
                    return (
                        <Chip
                            key={s}
                            label={s}
                            size="small"
                            sx={{
                                height: 18, fontSize: '0.65rem', fontWeight: 600,
                                background: has ? 'rgba(255,255,255,0.08)' : 'transparent',
                                color: has ? '#fff' : 'rgba(255,255,255,0.25)',
                                border: `1px solid ${has ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}`
                            }}
                        />
                    );
                })}
            </Box>
            <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                {matched.length}/{skills.length} skills matched
            </Typography>
        </GlassCard>
    );
}

export default function CareerPath() {
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
                console.error('[CareerPath] Failed to fetch history:', err);
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
                <Button variant="outlined" onClick={() => navigate('/upload')} size="small">Upload Resume</Button>
            </Box>
        );
    }

    const roadmap = data.roadmap ?? [];
    const aiPaths = data.career_paths && data.career_paths.length > 0 ? data.career_paths : null;
    const bestMatchPct = aiPaths
        ? Math.max(...aiPaths.map(p => p.match_percent ?? 0))
        : Math.max(...DEFAULT_ROLES.map(j => Math.round((j.skills.filter(s => data.skills.some(u => u.toLowerCase() === s.toLowerCase())).length / j.skills.length) * 100)));
    const roleMatchCount = aiPaths ? aiPaths.length : DEFAULT_ROLES.length;

    const roleComparisonList = aiPaths
        ? aiPaths.map(p => ({ role: p.role, fit: p.match_percent })).sort((a, b) => b.fit - a.fit)
        : DEFAULT_ROLES.map(j => {
            const matched = j.skills.filter(s => data.skills.some(u => u.toLowerCase() === s.toLowerCase()));
            const pct = Math.round((matched.length / j.skills.length) * 100);
            return { role: j.title, fit: Math.max(pct, 45) };
        }).sort((a, b) => b.fit - a.fit);

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>

            {/* Header */}
            <Box sx={{ mb: 4, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                    AI Career Roadmap
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', mb: 0.8, fontSize: { xs: '1.6rem', md: '2.125rem' } }}>
                    Career Pathways
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>
                    Step-by-step learning roadmap and career trajectory matching based on your skillset
                </Typography>
            </Box>

            {/* ── ROW 1: 4 stat cards ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.05s' }}>
                {[
                    { label: 'Target Roles Mapped', value: roleMatchCount,      icon: <WorkOutlineIcon sx={{ fontSize: 18 }} /> },
                    { label: 'Readiness Score',    value: data.readiness_score, icon: <StarBorderIcon sx={{ fontSize: 18 }} /> },
                    { label: 'Top Match Fit',      value: `${bestMatchPct}%`,   icon: <CheckCircleOutlineIcon sx={{ fontSize: 18 }} /> },
                    { label: 'Roadmap Milestones', value: roadmap.length,       icon: <TimelineOutlinedIcon sx={{ fontSize: 18 }} /> },
                ].map(({ label, value, icon }) => (
                    <GlassCard key={label} sx={{ p: { xs: 2, md: 2.5 } }}>
                        <Box sx={{ color: 'rgba(255,255,255,0.25)', mb: 1.5, display: 'flex' }}>{icon}</Box>
                        <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 900, color: '#fff', letterSpacing: '-0.06em', lineHeight: 1, mb: 0.5 }}>
                            {value}
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</Typography>
                    </GlassCard>
                ))}
            </Box>

            {/* ── ROW 2: Target Role Fit Comparison Chart ── */}
            <GlassCard sx={{ p: 3, mb: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.08s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <BarChartIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }} />
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>
                        Role Fit Comparison Overview
                    </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', mb: 1.5 }}>
                    Ranked alignment across primary engineering target trajectories
                </Typography>
                <RoleComparisonChart roles={roleComparisonList} />
            </GlassCard>

            {/* ── ROW 3: Main Flow (Roadmap flowchart + Role match cards) ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' }, gap: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.1s' }}>
                {/* SVG Learning Roadmap Flow */}
                <GlassCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <TimelineOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Roadmap Flow</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mb: 2.5 }}>
                        Sequential step-by-step career path
                    </Typography>
                    <RoadmapFlow steps={roadmap} />
                </GlassCard>

                {/* Role match cards grid */}
                <Box>
                    <GlassCard sx={{ p: 3, mb: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WorkOutlineIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Target Role Matches</Typography>
                            </Box>
                            <Button size="small" variant="text" onClick={() => navigate('/skills-gap')} endIcon={<ArrowForwardIcon sx={{ fontSize: '13px !important' }} />} sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                                View Gaps
                            </Button>
                        </Box>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            {aiPaths
                                ? aiPaths.map(p => (
                                    <RoleCard
                                        key={p.role}
                                        title={p.role}
                                        salary={p.salary_range ?? '$100k–$150k'}
                                        demand={p.match_percent >= 75 ? 'Very High' : 'High'}
                                        skills={p.skills_needed ?? []}
                                        userSkills={data.skills}
                                    />
                                ))
                                : DEFAULT_ROLES.map(job => (
                                    <RoleCard key={job.title} {...job} userSkills={data.skills} />
                                ))
                            }
                        </Box>
                    </GlassCard>
                </Box>
            </Box>
        </Box>
    );
}
