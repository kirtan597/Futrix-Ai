import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';

interface AnalysisData {
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap: string[];
}

// Priority levels for gaps
const PRIORITY: Record<string, { level: 'critical' | 'high' | 'medium'; course: string }> = {
    'Docker':      { level: 'critical', course: 'Docker Deep Dive — Udemy' },
    'Kubernetes':  { level: 'critical', course: 'Kubernetes for Beginners — KodeKloud' },
    'AWS':         { level: 'high',     course: 'AWS Cloud Practitioner — AWS Training' },
    'TypeScript':  { level: 'high',     course: 'TypeScript Full Course — FreeCodeCamp' },
    'GraphQL':     { level: 'medium',   course: 'Full Stack GQL — Odyssey Apollo' },
    'Redis':       { level: 'medium',   course: 'Redis University — Free Course' },
    'Go':          { level: 'medium',   course: 'Tour of Go — go.dev' },
    'CI/CD':       { level: 'high',     course: 'GitHub Actions — GitHub Learning Lab' },
    'PostgreSQL':  { level: 'medium',   course: 'PostgreSQL Tutorial — PostgreSQL.org' },
    'Java':        { level: 'high',     course: 'Java Masterclass — Udemy' },
};

const PRIORITY_COLOR = {
    critical: { bg: 'rgba(248,113,113,0.06)', border: 'rgba(248,113,113,0.15)', text: 'rgba(248,113,113,0.7)', label: 'Critical' },
    high:     { bg: 'rgba(251,191,36,0.06)',  border: 'rgba(251,191,36,0.15)',  text: 'rgba(251,191,36,0.7)', label: 'High' },
    medium:   { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.07)', text: 'rgba(255,255,255,0.35)', label: 'Medium' },
};

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box sx={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: '18px', ...sx }}>
            {children}
        </Box>
    );
}

// Heatmap cell component
function HeatCell({ skill, level }: { skill: string; level: 'have' | 'gap' }) {
    const bg = level === 'have'
        ? `rgba(255,255,255,${0.04 + Math.random() * 0.08})`
        : 'rgba(255,255,255,0.015)';
    const border = level === 'have'
        ? 'rgba(255,255,255,0.12)'
        : 'rgba(255,255,255,0.04)';
    return (
        <Box sx={{
            px: 1.5, py: 0.7, borderRadius: '8px',
            background: bg, border: `1px solid ${border}`,
            fontSize: '0.77rem', fontWeight: 600,
            color: level === 'have' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.22)',
            transition: 'all 0.18s',
            '&:hover': { transform: 'translateY(-1px)', filter: 'brightness(1.3)' },
        }}>
            {skill}
        </Box>
    );
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
        info: PRIORITY[g] ?? { level: 'medium' as const, course: `Search "${g} tutorial" on YouTube` },
    }));

    const critical = categorized.filter(x => x.info.level === 'critical');
    const high = categorized.filter(x => x.info.level === 'high');
    const medium = categorized.filter(x => x.info.level === 'medium');

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>

            {/* Header */}
            <Box sx={{ mb: 5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                    Gap Intelligence
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', mb: 0.8 }}>
                    Skills Gap Analysis
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>
                    Detailed breakdown of missing skills with learning resources
                </Typography>
            </Box>

            {/* Summary cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.05s' }}>
                {[
                    { label: 'Critical Gaps', count: critical.length, color: 'rgba(248,113,113,0.7)' },
                    { label: 'High Priority', count: high.length,     color: 'rgba(251,191,36,0.7)' },
                    { label: 'Medium Priority', count: medium.length, color: 'rgba(255,255,255,0.4)' },
                ].map(({ label, count, color }) => (
                    <GlassCard key={label} sx={{ p: 2.5 }}>
                        <Typography sx={{ fontSize: '2rem', fontWeight: 900, color, letterSpacing: '-0.06em', lineHeight: 1, mb: 0.5 }}>
                            {count}
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</Typography>
                    </GlassCard>
                ))}
            </Box>

            {/* Skill Heatmap */}
            <GlassCard sx={{ p: 3.5, mb: 2.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.1s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <TrendingUpOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Skill Heatmap</Typography>
                    <Box sx={{ ml: 'auto', display: 'flex', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '3px', background: 'rgba(255,255,255,0.25)' }} />
                            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>Have</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '3px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
                            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>Gap</Typography>
                        </Box>
                    </Box>
                </Box>
                <Divider sx={{ mb: 2.5 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {data.skills.map(s => <HeatCell key={s} skill={s} level="have" />)}
                    {data.gap_skills.map(g => <HeatCell key={g} skill={g} level="gap" />)}
                </Box>
            </GlassCard>

            {/* Gap accordion list */}
            <GlassCard sx={{ p: 3.5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.15s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <SchoolOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Learning Resources</Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />

                {[
                    { title: 'Critical', items: critical, color: PRIORITY_COLOR.critical },
                    { title: 'High Priority', items: high, color: PRIORITY_COLOR.high },
                    { title: 'Medium Priority', items: medium, color: PRIORITY_COLOR.medium },
                ].map(({ title, items, color }) => items.length > 0 && (
                    <Box key={title} sx={{ mb: 2 }}>
                        <Chip label={title} size="small" sx={{ mb: 1.5, background: color.bg, border: `1px solid ${color.border}`, color: color.text, fontWeight: 700, fontSize: '0.72rem' }} />
                        {items.map(({ skill, info }, i) => (
                            <Accordion key={skill} disableGutters elevation={0} sx={{
                                background: 'transparent',
                                border: `1px solid ${color.border}`,
                                borderRadius: '10px !important',
                                mb: 1,
                                '&:before': { display: 'none' },
                                '&.Mui-expanded': { background: 'rgba(255,255,255,0.02)' },
                                animation: `fadeUp 0.35s ease both`, animationDelay: `${i * 0.04}s`,
                            }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.3)' }} />}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: color.text, flexShrink: 0 }} />
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{skill}</Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Box sx={{ pl: 2.5 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <SchoolOutlinedIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.25)' }} />
                                            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Recommended: </Typography>
                                            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{info.course}</Typography>
                                        </Box>
                                        <LinearProgress variant="determinate" value={15} sx={{ mt: 1.5, mb: 0.5, height: 3 }} />
                                        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}>Progress: 0% · Not started</Typography>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Box>
                ))}

                {/* Already have */}
                <Box sx={{ mt: 2 }}>
                    <Chip label="You already have these" size="small" icon={<CheckCircleOutlineIcon sx={{ fontSize: '12px !important', color: 'rgba(255,255,255,0.3) !important' }} />} sx={{ mb: 1.5, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)', fontWeight: 700, fontSize: '0.72rem' }} />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
                        {data.skills.map(s => (
                            <Chip key={s} label={s} size="small" sx={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '0.73rem' }} />
                        ))}
                    </Box>
                </Box>
            </GlassCard>
        </Box>
    );
}
