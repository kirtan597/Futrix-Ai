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

const JOB_MATCH = [
    { title: 'Frontend Engineer',    salary: '$85k–$130k', demand: 'High',      skills: ['React','TypeScript','CSS','JavaScript']           },
    { title: 'Full Stack Developer', salary: '$90k–$145k', demand: 'Very High', skills: ['React','Node.js','MongoDB','REST API','Docker']    },
    { title: 'Backend Engineer',     salary: '$95k–$150k', demand: 'High',      skills: ['Node.js','Python','MongoDB','Docker','AWS']        },
    { title: 'ML Engineer',          salary: '$120k–$180k', demand: 'Very High', skills: ['Python','Machine Learning','TensorFlow','Docker'] },
];

interface CareerPathItem {
    role: string;
    match_percent: number;
    salary_range: string;
    skills_needed: string[];
    matched_skills: string[];
    missing_skills: string[];
}
interface AnalysisData { skills: string[]; gap_skills: string[]; readiness_score: number; roadmap: string[]; career_paths?: CareerPathItem[] }

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return <Box sx={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: '18px', ...sx }}>{children}</Box>;
}

// ─── Mini Score Ring ──────────────────────────────────────────────────────────
function MiniRing({ pct, size = 52 }: { pct: number; size?: number }) {
    const sw = 4, r = (size / 2) - sw;
    const circ = 2 * Math.PI * r;
    const offset = ((100 - pct) / 100) * circ;
    const color = pct >= 75 ? '#e5e5e5' : pct >= 50 ? '#a3a3a3' : '#525252';
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} />
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
                    strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
            </svg>
            <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 900, color, lineHeight: 1 }}>{pct}%</Typography>
            </Box>
        </Box>
    );
}

// ─── SVG Roadmap Flowchart ────────────────────────────────────────────────────
function RoadmapFlow({ steps }: { steps: string[] }) {
    if (!steps.length) return null;
    const NODE_W = 220, NODE_H = 52, GAP_Y = 32, PX = 24;
    const totalH = steps.length * (NODE_H + GAP_Y) - GAP_Y + PX * 2;
    const cx = NODE_W / 2 + PX;

    return (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <svg width={NODE_W + PX * 2} height={totalH} style={{ display: 'block', margin: '0 auto' }}>
                <defs>
                    <linearGradient id="nodeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%"   stopColor="rgba(255,255,255,0.07)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {steps.map((step, i) => {
                    const y = PX + i * (NODE_H + GAP_Y);
                    const isLast = i === steps.length - 1;
                    const lineY1 = y + NODE_H, lineY2 = y + NODE_H + GAP_Y;
                    // truncate
                    const label = step.length > 28 ? step.slice(0, 27) + '…' : step;

                    return (
                        <g key={i} style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.08}s` }}>
                            {/* Connector line */}
                            {!isLast && (
                                <g>
                                    <line x1={cx} y1={lineY1} x2={cx} y2={lineY2}
                                        stroke="rgba(255,255,255,0.1)" strokeWidth={1.5} strokeDasharray="4 4" />
                                    {/* Arrow */}
                                    <polygon points={`${cx},${lineY2} ${cx-4},${lineY2-7} ${cx+4},${lineY2-7}`}
                                        fill="rgba(255,255,255,0.18)" />
                                </g>
                            )}
                            {/* Node card */}
                            <rect x={PX} y={y} width={NODE_W} height={NODE_H} rx={12} ry={12}
                                fill={i === 0 ? 'rgba(255,255,255,0.08)' : 'url(#nodeGrad)'}
                                stroke={i === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}
                                strokeWidth={1} filter={i === 0 ? 'url(#glow)' : undefined} />
                            {/* Step number badge */}
                            <rect x={PX + 10} y={y + 14} width={22} height={22} rx={6} fill="rgba(255,255,255,0.07)" />
                            <text x={PX + 21} y={y + 28} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize={9} fontWeight="700" fontFamily="Inter,sans-serif">{String(i + 1).padStart(2, '0')}</text>
                            {/* Label */}
                            <text x={PX + 44} y={y + NODE_H / 2 + 4} fill={i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.58)'} fontSize={11} fontWeight={i === 0 ? '700' : '500'} fontFamily="Inter,sans-serif">{label}</text>
                        </g>
                    );
                })}
            </svg>
        </Box>
    );
}

// ─── Role card ────────────────────────────────────────────────────────────────
function RoleCard({ title, salary, demand, skills, userSkills }: { title: string; salary: string; demand: string; skills: string[]; userSkills: string[] }) {
    const matched = skills.filter(s => userSkills.some(u => u.toLowerCase() === s.toLowerCase()));
    const pct = Math.round((matched.length / skills.length) * 100);
    return (
        <GlassCard sx={{
            p: 2.5, transition: 'all 0.25s',
            '&:hover': { borderColor: 'rgba(255,255,255,0.14)', transform: 'translateY(-3px)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' },
        }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                    <Typography sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', mb: 0.5 }}>{title}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>{salary}</Typography>
                </Box>
                <MiniRing pct={pct} />
            </Box>
            <Chip label={`${demand} demand`} size="small" sx={{ mb: 1.5, height: 18, fontSize: '0.62rem', fontWeight: 700, background: demand === 'Very High' ? 'rgba(134,239,172,0.08)' : 'rgba(255,255,255,0.05)', color: demand === 'Very High' ? 'rgba(134,239,172,0.75)' : 'rgba(255,255,255,0.4)', border: `1px solid ${demand === 'Very High' ? 'rgba(134,239,172,0.15)' : 'rgba(255,255,255,0.08)'}` }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                {skills.map(s => {
                    const has = userSkills.some(u => u.toLowerCase() === s.toLowerCase());
                    return (
                        <Chip key={s} label={s} size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, background: has ? 'rgba(255,255,255,0.07)' : 'transparent', color: has ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)', border: `1px solid ${has ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)'}` }} />
                    );
                })}
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)' }}>{matched.length}/{skills.length} skills matched</Typography>
        </GlassCard>
    );
}

export default function CareerPath() {
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
                <Button variant="outlined" onClick={() => navigate('/upload')} size="small">Upload Resume</Button>
            </Box>
        );
    }

    const roadmap = data.roadmap ?? [];
    // If AI returned career_paths objects, use them; otherwise fall back to JOB_MATCH
    const aiPaths = data.career_paths && data.career_paths.length > 0 ? data.career_paths : null;
    const bestMatchPct = aiPaths
        ? Math.max(...aiPaths.map(p => p.match_percent ?? 0))
        : Math.max(...JOB_MATCH.map(j => Math.round((j.skills.filter(s => data.skills.some(u => u.toLowerCase() === s.toLowerCase())).length / j.skills.length) * 100)));
    const roleMatchCount = aiPaths ? aiPaths.length : JOB_MATCH.length;

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>

            {/* Header */}
            <Box sx={{ mb: 4, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                    AI Career Roadmap
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', mb: 0.8, fontSize: { xs: '1.6rem', md: '2.125rem' } }}>
                            Career Path
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>
                            Personalized roadmap + top role matches based on your skill profile
                        </Typography>
                    </Box>
                    <Button variant="outlined" size="small" onClick={() => navigate('/skills-gap')} endIcon={<ArrowForwardIcon />} sx={{ borderRadius: '10px', fontSize: '0.8rem', px: 2 }}>
                        View Gaps
                    </Button>
                </Box>
            </Box>

            {/* Stat strip */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.05s' }}>
                {[
                    { label: 'Roadmap Steps',  value: roadmap.length, icon: <TimelineOutlinedIcon sx={{ fontSize: 18 }} /> },
                    { label: 'Best Role Match', value: `${bestMatchPct}%`, icon: <StarBorderIcon sx={{ fontSize: 18 }} /> },
                    { label: 'Skills Verified', value: data.skills.length, icon: <CheckCircleOutlineIcon sx={{ fontSize: 18 }} /> },
                    { label: 'Role Matches',    value: roleMatchCount, icon: <WorkOutlineIcon sx={{ fontSize: 18 }} /> },
                ].map(({ label, value, icon }) => (
                    <GlassCard key={label} sx={{ p: { xs: 2, md: 2.5 } }}>
                        <Box sx={{ color: 'rgba(255,255,255,0.25)', mb: 1.5, display: 'flex' }}>{icon}</Box>
                        <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 900, color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.06em', lineHeight: 1, mb: 0.5 }}>{value}</Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</Typography>
                    </GlassCard>
                ))}
            </Box>

            {/* ── Main layout: Flowchart + Role Cards ── */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' }, gap: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.1s' }}>

                {/* Left: SVG Roadmap Flowchart */}
                <GlassCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <TimelineOutlinedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Learning Roadmap</Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mb: 2.5 }}>
                        Step-by-step path to your target role
                    </Typography>
                    {roadmap.length > 0 ? (
                        <RoadmapFlow steps={roadmap} />
                    ) : (
                        <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', textAlign: 'center', py: 4 }}>
                            No roadmap generated. Upload resume to get started.
                        </Typography>
                    )}
                </GlassCard>

                {/* Right: Role Match Cards */}
                <Box>
                    <GlassCard sx={{ p: 3, mb: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <WorkOutlineIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Top Role Matches</Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mb: 2.5 }}>
                            Based on your current skill profile — ring shows match %
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                            {aiPaths
                                ? aiPaths.map(p => (
                                    <RoleCard
                                        key={p.role}
                                        title={p.role}
                                        salary={p.salary_range ?? '—'}
                                        demand={p.match_percent >= 75 ? 'Very High' : p.match_percent >= 50 ? 'High' : 'Medium'}
                                        skills={p.skills_needed ?? []}
                                        userSkills={data.skills}
                                    />
                                ))
                                : JOB_MATCH.map(job => (
                                    <RoleCard key={job.title} {...job} userSkills={data.skills} />
                                ))
                            }
                        </Box>
                    </GlassCard>

                    {/* AI Suggested Paths — only shown when we have extra context beyond role cards */}
                    {aiPaths && aiPaths.length > 0 && (
                        <GlassCard sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <StarBorderIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.35)' }} />
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>AI Suggested Paths</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {aiPaths.map((p, i) => (
                                    <Chip
                                        key={i}
                                        label={p.role}
                                        sx={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.09)', fontWeight: 600, fontSize: '0.78rem', height: 28, '&:hover': { background: 'rgba(255,255,255,0.09)', color: '#fff' } }}
                                    />
                                ))}
                            </Box>
                        </GlassCard>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
