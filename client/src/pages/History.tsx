import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';

// Mock history data (in real app, would come from MongoDB /api/history)
const MOCK_HISTORY = [
    {
        id: 1,
        date: '2026-04-10',
        skills: ['React', 'TypeScript', 'Node.js', 'Python', 'MongoDB', 'Docker', 'Git', 'REST API'],
        gap_skills: ['Kubernetes', 'AWS', 'GraphQL', 'Redis', 'Go'],
        readiness_score: 72,
        roadmap_steps: 5,
    },
    {
        id: 2,
        date: '2026-03-22',
        skills: ['React', 'JavaScript', 'Node.js', 'Git', 'REST API'],
        gap_skills: ['TypeScript', 'Docker', 'MongoDB', 'Kubernetes', 'AWS', 'GraphQL', 'Redis'],
        readiness_score: 54,
        roadmap_steps: 7,
    },
    {
        id: 3,
        date: '2026-02-14',
        skills: ['React', 'JavaScript', 'Git'],
        gap_skills: ['TypeScript', 'Node.js', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'GraphQL', 'Redis', 'Go'],
        readiness_score: 38,
        roadmap_steps: 9,
    },
];

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
    return (
        <Box sx={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.065)', borderRadius: '18px', ...sx }}>
            {children}
        </Box>
    );
}

export default function History() {
    const [mounted, setMounted] = useState(false);
    const [real, setReal] = useState<typeof MOCK_HISTORY[0] | null>(null);

    useEffect(() => {
        // Inject current real analysis as the latest entry if available
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

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>

            {/* Header */}
            <Box sx={{ mb: 5, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s' }}>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.14em', textTransform: 'uppercase', mb: 0.8 }}>
                    Analysis History
                </Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', mb: 0.8 }}>
                    Past Analyses
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.88rem' }}>
                    Track your career readiness progress over time
                </Typography>
            </Box>

            {/* Progress overview */}
            <GlassCard sx={{ p: 3.5, mb: 3, opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.06s' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AutoAwesomeOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Progress Overview</Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />
                <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
                    {history.map((h, i) => {
                        const isLatest = i === 0;
                        return (
                            <Box key={h.id} sx={{
                                flexShrink: 0,
                                background: 'rgba(255,255,255,0.02)',
                                border: `1px solid ${isLatest ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: '14px', p: 2,
                                minWidth: 120, textAlign: 'center',
                                position: 'relative',
                            }}>
                                {isLatest && (
                                    <Chip label="Latest" size="small" sx={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', height: 18, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }} />
                                )}
                                <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.06em', lineHeight: 1, mb: 0.5 }}>
                                    {h.readiness_score}
                                </Typography>
                                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', mb: 0.3 }}>score</Typography>
                                <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)' }}>{h.date}</Typography>
                            </Box>
                        );
                    })}

                    {/* Growth arrow */}
                    <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', transform: 'rotate(90deg)' }}>⬇</Typography>
                    </Box>
                </Box>
            </GlassCard>

            {/* Timeline */}
            <Box sx={{ position: 'relative', opacity: mounted ? 1 : 0, transition: 'opacity 0.5s 0.1s' }}>
                {history.map((h, i) => {
                    const isLatest = i === 0;
                    const prev = history[i + 1];
                    const delta = prev ? h.readiness_score - prev.readiness_score : null;

                    return (
                        <Box key={h.id} sx={{ display: 'flex', gap: 3, mb: 2.5, animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.07}s` }}>
                            {/* Timeline dot */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                <Box sx={{
                                    width: 28, height: 28, borderRadius: '50%', zIndex: 1,
                                    background: isLatest ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${isLatest ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: isLatest ? '0 0 18px rgba(255,255,255,0.12)' : 'none',
                                }}>
                                    <ArticleOutlinedIcon sx={{ fontSize: 14, color: isLatest ? '#fff' : 'rgba(255,255,255,0.3)' }} />
                                </Box>
                                {i < history.length - 1 && (
                                    <Box sx={{ width: 1, flex: 1, minHeight: 24, background: 'rgba(255,255,255,0.06)', mt: 0.5 }} />
                                )}
                            </Box>

                            {/* Card */}
                            <GlassCard sx={{
                                flex: 1, p: 3,
                                borderColor: isLatest ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.055)',
                                mb: i < history.length - 1 ? 0 : 0,
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.28)' }} />
                                            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                                                {new Date(h.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </Typography>
                                            {isLatest && <Chip label="Latest" size="small" sx={{ height: 17, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }} />}
                                        </Box>
                                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)' }}>
                                            Analysis #{history.length - i}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.05em', lineHeight: 1 }}>
                                            {h.readiness_score}
                                        </Typography>
                                        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>readiness</Typography>
                                        {delta !== null && (
                                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: delta > 0 ? 'rgba(74,222,128,0.7)' : 'rgba(248,113,113,0.7)', mt: 0.2 }}>
                                                {delta > 0 ? '+' : ''}{delta} pts
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Skills</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                                            {h.skills.slice(0, 5).map(s => (
                                                <Chip key={s} label={s} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }} />
                                            ))}
                                            {h.skills.length > 5 && <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', alignSelf: 'center' }}>+{h.skills.length - 5}</Typography>}
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Gaps</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.7 }}>
                                            {h.gap_skills.slice(0, 4).map(g => (
                                                <Chip key={g} label={g} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.28)', border: '1px solid rgba(255,255,255,0.06)' }} />
                                            ))}
                                            {h.gap_skills.length > 4 && <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', alignSelf: 'center' }}>+{h.gap_skills.length - 4}</Typography>}
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Roadmap</Typography>
                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{h.roadmap_steps} steps</Typography>
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
