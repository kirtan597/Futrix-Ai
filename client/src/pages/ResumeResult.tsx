import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';

import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import EastIcon from '@mui/icons-material/East';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

import ScoreRing from '../components/ScoreRing';
import SkillRadar from '../components/charts/SkillRadar';
import GapDonut from '../components/charts/GapDonut';

interface AnalysisData {
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap: string[];
}

// AI tips based on gaps
function generateTips(gaps: string[]): string[] {
    const tip_map: Record<string, string> = {
        'Docker':     'Add Docker containerization to your workflow — start with a Dockerfile for your current project.',
        'Kubernetes': 'Learn Kubernetes basics via the official k8s tutorial; focus on pods, deployments, and services.',
        'AWS':        'Complete the AWS Cloud Practitioner free course to understand cloud architecture.',
        'TypeScript': 'Migrate one JavaScript file per week to TypeScript; use "strict" mode to build best habits.',
        'GraphQL':    'Build a small GraphQL API using Apollo Server and connect it to a React client.',
        'Redis':      'Use Redis for caching in your Node.js API — start with session management.',
        'CI/CD':      'Set up GitHub Actions for your next project — automate tests and deployments.',
        'Go':         'Go has excellent concurrency features; start with the official tour at go.dev/tour.',
    };
    const tips: string[] = [];
    gaps.forEach(g => { if (tip_map[g]) tips.push(tip_map[g]); });
    if (tips.length < 3) tips.push(
        'Focus on projects that combine multiple skills to accelerate learning.',
        'Contribute to open-source projects to build real-world experience.',
        'Document your learning with a blog or GitHub portfolio.',
    );
    return tips.slice(0, 5);
}

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box sx={{
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.065)',
            borderRadius: '18px',
            transition: 'all 0.25s',
            '&:hover': { borderColor: 'rgba(255,255,255,0.12)', boxShadow: '0 12px 40px rgba(0,0,0,0.4)' },
            ...sx,
        }}>
            {children}
        </Box>
    );
}

function SectionTitle({ icon, title, count }: { icon: React.ReactNode; title: string; count?: number }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: 'rgba(255,255,255,0.35)', display: 'flex' }}>{icon}</Box>
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>{title}</Typography>
            </Box>
            {count !== undefined && (
                <Chip label={count} size="small" sx={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontWeight: 700, border: '1px solid rgba(255,255,255,0.08)' }} />
            )}
        </Box>
    );
}

export default function ResumeResult() {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const stored = localStorage.getItem('analysisResult');
        if (stored) { try { setData(JSON.parse(stored)); } catch { /* */ } }
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

    if (!data) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 2, background: '#0a0a0a' }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No analysis data found.</Typography>
                <Button variant="outlined" onClick={() => navigate('/upload')} size="small">Upload Resume</Button>
            </Box>
        );
    }

    const tips = generateTips(data.gap_skills);
    const coveragePct = data.skills.length
        ? Math.round((data.skills.length / (data.skills.length + data.gap_skills.length)) * 100)
        : 0;

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>

            {/* Header */}
            <Box sx={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 5, flexWrap: 'wrap', gap: 2,
                opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'opacity 0.5s, transform 0.5s',
            }}>
                <Box>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                        AI Analysis
                    </Typography>
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em' }}>
                        Resume Result
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.28)', fontSize: '0.83rem', mt: 0.8 }}>
                        Full breakdown of your career intelligence report
                    </Typography>
                </Box>
                <Button variant="outlined" size="small" startIcon={<UploadFileOutlinedIcon />} onClick={() => navigate('/upload')} sx={{ borderRadius: '9px', fontSize: '0.8rem' }}>
                    Re-analyze
                </Button>
            </Box>

            {/* Top row: Score + chart + chart */}
            <Box sx={{
                display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr 1fr' }, gap: 2.5, mb: 2.5,
                opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.08s',
            }}>
                {/* Score */}
                <GlassCard sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 1 }}>
                        Readiness Score
                    </Typography>
                    <ScoreRing score={data.readiness_score} size={140} animated />
                    <Divider sx={{ width: '60%', my: 1.5 }} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.6 }}>
                        {data.skills.length} skills · {data.gap_skills.length} gaps
                    </Typography>
                </GlassCard>

                {/* Radar */}
                <GlassCard sx={{ p: 3 }}>
                    <SectionTitle icon={<BarChartOutlinedIcon sx={{ fontSize: 17 }} />} title="Skill Proficiency Radar" />
                    <Divider sx={{ mb: 2.5 }} />
                    <SkillRadar skills={data.skills} gapSkills={data.gap_skills} />
                </GlassCard>

                {/* Donut */}
                <GlassCard sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <SectionTitle icon={<AutoGraphOutlinedIcon sx={{ fontSize: 17 }} />} title="Skill Coverage" />
                    <Divider sx={{ mb: 2 }} />
                    <GapDonut skillsCount={data.skills.length} gapCount={data.gap_skills.length} />
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mt: 1 }}>
                        {coveragePct}% of standard stack covered
                    </Typography>
                </GlassCard>
            </Box>

            {/* Skills + Gaps side by side */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>

                {/* Skills */}
                <GlassCard sx={{ p: 3.5 }}>
                    <SectionTitle icon={<CheckCircleOutlineIcon sx={{ fontSize: 17 }} />} title="Identified Skills" count={data.skills.length} />
                    <Divider sx={{ mb: 2.5 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9, mb: 3 }}>
                        {data.skills.map((s, i) => (
                            <Box key={s} sx={{
                                px: 1.5, py: 0.55, borderRadius: '7px', fontSize: '0.77rem', fontWeight: 600,
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                color: 'rgba(255,255,255,0.75)', cursor: 'default',
                                transition: 'all 0.18s',
                                animation: `fadeUp 0.35s ease both`, animationDelay: `${i * 0.025}s`,
                                '&:hover': { background: 'rgba(255,255,255,0.11)', color: '#fff', transform: 'translateY(-1px)' },
                            }}>
                                {s}
                            </Box>
                        ))}
                    </Box>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)' }}>Coverage</Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{coveragePct}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={coveragePct} />
                    </Box>
                </GlassCard>

                {/* Gaps */}
                <GlassCard sx={{ p: 3.5 }}>
                    <SectionTitle icon={<TrendingUpOutlinedIcon sx={{ fontSize: 17 }} />} title="Skill Gaps to Bridge" count={data.gap_skills.length} />
                    <Divider sx={{ mb: 2.5 }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9, mb: 3 }}>
                        {data.gap_skills.map((g, i) => (
                            <Box key={g} sx={{
                                px: 1.5, py: 0.55, borderRadius: '7px', fontSize: '0.77rem', fontWeight: 600,
                                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
                                color: 'rgba(255,255,255,0.38)', cursor: 'default',
                                transition: 'all 0.18s',
                                animation: `fadeUp 0.35s ease both`, animationDelay: `${i * 0.025}s`,
                                '&:hover': { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', transform: 'translateY(-1px)' },
                            }}>
                                {g}
                            </Box>
                        ))}
                    </Box>
                    <Button
                        variant="outlined"
                        size="small"
                        endIcon={<EastIcon sx={{ fontSize: '13px !important' }} />}
                        onClick={() => navigate('/skills-gap')}
                        fullWidth
                        sx={{ borderRadius: '9px', fontSize: '0.78rem' }}
                    >
                        View Gap Analysis
                    </Button>
                </GlassCard>
            </Box>

            {/* AI Tips + Roadmap */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>

                {/* AI Tips */}
                <GlassCard sx={{ p: 3.5 }}>
                    <SectionTitle icon={<LightbulbOutlinedIcon sx={{ fontSize: 17 }} />} title="AI Suggestions" />
                    <Divider sx={{ mb: 2.5 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {tips.map((tip, i) => (
                            <Box key={i} sx={{
                                display: 'flex', gap: 1.8, alignItems: 'flex-start',
                                animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.06}s`,
                            }}>
                                <Box sx={{
                                    width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <StarOutlineIcon sx={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }} />
                                </Box>
                                <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
                                    {tip}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </GlassCard>

                {/* Full Roadmap */}
                <GlassCard sx={{ p: 3.5 }}>
                    <SectionTitle icon={<AutoGraphOutlinedIcon sx={{ fontSize: 17 }} />} title="Full Roadmap" count={data.roadmap?.length} />
                    <Divider sx={{ mb: 2.5 }} />
                    <Box sx={{ position: 'relative', pl: 2 }}>
                        <Box sx={{ position: 'absolute', left: '9px', top: 12, bottom: 12, width: '1px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.02))' }} />
                        {data.roadmap?.map((step, i) => (
                            <Box key={i} sx={{
                                display: 'flex', gap: 2, mb: i < data.roadmap.length - 1 ? 2.2 : 0,
                                animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.05}s`,
                            }}>
                                <Box sx={{
                                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                                    background: i === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', mt: '2px',
                                }}>
                                    <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.3)' }}>{i + 1}</Typography>
                                </Box>
                                <Typography sx={{
                                    fontSize: '0.82rem',
                                    color: i === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.38)',
                                    lineHeight: 1.6, flex: 1,
                                }}>
                                    {step}
                                    {i === 0 && <Chip label="Next" size="small" sx={{ ml: 1, height: 17, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} />}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </GlassCard>
            </Box>
        </Box>
    );
}
