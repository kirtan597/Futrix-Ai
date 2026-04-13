import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';

import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

interface AnalysisData {
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap: string[];
}

// Role match cards based on detected skills
const ROLES = [
    {
        title: 'Frontend Engineer',
        requiredSkills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
        salary: '$85k – $130k',
        demand: 'High',
    },
    {
        title: 'Full Stack Developer',
        requiredSkills: ['React', 'Node.js', 'MongoDB', 'REST API', 'Docker'],
        salary: '$90k – $145k',
        demand: 'Very High',
    },
    {
        title: 'Backend Engineer',
        requiredSkills: ['Node.js', 'Python', 'MongoDB', 'Docker', 'AWS'],
        salary: '$95k – $150k',
        demand: 'High',
    },
    {
        title: 'DevOps Engineer',
        requiredSkills: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux'],
        salary: '$100k – $160k',
        demand: 'Very High',
    },
];

function matchScore(skills: string[], required: string[]): number {
    const matched = required.filter(r => skills.some(s => s.toLowerCase().includes(r.toLowerCase())));
    return Math.round((matched.length / required.length) * 100);
}

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box sx={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: '18px', ...sx }}>
            {children}
        </Box>
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
                <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No data. Upload a resume first.</Typography>
                <Button variant="outlined" size="small" onClick={() => navigate('/upload')} startIcon={<UploadFileOutlinedIcon />}>Upload</Button>
            </Box>
        );
    }

    const roleMatches = ROLES.map(r => ({
        ...r,
        match: matchScore(data.skills, r.requiredSkills),
    })).sort((a, b) => b.match - a.match);

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>

            {/* Header */}
            <Box sx={{ mb: 5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                    Career Intelligence
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', mb: 0.8 }}>
                    Career Path
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>
                    Personalized roadmap and role match analysis
                </Typography>
            </Box>

            {/* Role Match Cards */}
            <Box sx={{ mb: 3, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.06s' }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 2 }}>
                    Role Matches
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                    {roleMatches.map(({ title, requiredSkills, salary, demand, match }, i) => (
                        <GlassCard key={title} sx={{
                            p: 2.5,
                            transition: 'all 0.25s',
                            '&:hover': { borderColor: 'rgba(255,255,255,0.14)', transform: 'translateY(-3px)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' },
                            animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.07}s`,
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                <Box sx={{
                                    width: 36, height: 36, borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <WorkOutlineIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }} />
                                </Box>
                                <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: match >= 60 ? '#fff' : 'rgba(255,255,255,0.4)', letterSpacing: '-0.05em', lineHeight: 1 }}>
                                    {match}%
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', mb: 0.5, lineHeight: 1.3 }}>
                                {title}
                            </Typography>
                            <Typography sx={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)', mb: 1.5 }}>
                                {salary}
                            </Typography>
                            <Chip label={demand} size="small" sx={{ mb: 1.5, height: 19, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }} />
                            <LinearProgress variant="determinate" value={match} sx={{ height: 3, borderRadius: 99, mb: 1.5 }} />
                            {/* matched skills */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {requiredSkills.slice(0, 3).map(s => {
                                    const has = data.skills.some(sk => sk.toLowerCase().includes(s.toLowerCase()));
                                    return (
                                        <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            {has
                                                ? <CheckCircleOutlineIcon sx={{ fontSize: 11, color: 'rgba(74,222,128,0.6)' }} />
                                                : <RadioButtonUncheckedIcon sx={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }} />
                                            }
                                            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{s}</Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </GlassCard>
                    ))}
                </Box>
            </Box>

            {/* Full Roadmap timeline */}
            <GlassCard sx={{ p: 3.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.12s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TimelineOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Learning Roadmap</Typography>
                    </Box>
                    <Chip label={`${data.roadmap?.length ?? 0} steps`} size="small" sx={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: '0.72rem', border: '1px solid rgba(255,255,255,0.08)' }} />
                </Box>
                <Divider sx={{ mb: 3 }} />

                {/* Timeline */}
                <Box sx={{ position: 'relative' }}>
                    {/* Vertical line */}
                    <Box sx={{
                        position: 'absolute', left: '10px', top: 14, bottom: 10,
                        width: '1px',
                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(255,255,255,0.02))',
                    }} />

                    {data.roadmap?.map((step, i) => (
                        <Box key={i} sx={{
                            display: 'flex', gap: 2.5, mb: 2.5,
                            animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.055}s`,
                        }}>
                            {/* Node */}
                            <Box sx={{
                                width: 22, height: 22, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                                background: i === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${i === 0 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.1)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: i === 0 ? '0 0 14px rgba(255,255,255,0.15)' : 'none',
                            }}>
                                {i === 0
                                    ? <StarOutlineIcon sx={{ fontSize: 11, color: '#fff' }} />
                                    : <Typography sx={{ fontSize: '0.57rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{i + 1}</Typography>
                                }
                            </Box>

                            {/* Step content */}
                            <Box sx={{
                                flex: 1, p: 2,
                                borderRadius: '12px',
                                background: i === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${i === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
                                transition: 'all 0.2s',
                                '&:hover': { borderColor: 'rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.04)' },
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                                    <Typography sx={{
                                        fontSize: '0.85rem',
                                        fontWeight: i === 0 ? 600 : 500,
                                        color: i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.42)',
                                        lineHeight: 1.6,
                                    }}>
                                        {step}
                                    </Typography>
                                    {i === 0 && (
                                        <Chip label="Up Next" size="small" sx={{
                                            flexShrink: 0, height: 18, fontSize: '0.62rem', fontWeight: 700,
                                            background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        }} />
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    ))}
                </Box>
            </GlassCard>
        </Box>
    );
}
