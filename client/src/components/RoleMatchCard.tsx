import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';

import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface RoleMatch {
    title: string;
    matchPercent: number;
    salary: string;
    demand: 'Very High' | 'High' | 'Medium' | 'Low';
    matchedSkills: string[];
    missingSkills: string[];
}

interface RoleMatchCardProps {
    role: RoleMatch;
    index?: number;
}

const DEMAND_COLOR: Record<string, string> = {
    'Very High': 'rgba(74,222,128,0.7)',
    'High':      'rgba(255,255,255,0.6)',
    'Medium':    'rgba(163,163,163,0.6)',
    'Low':       'rgba(115,115,115,0.5)',
};

export default function RoleMatchCard({ role, index = 0 }: RoleMatchCardProps) {
    const [expanded, setExpanded] = useState(false);

    const grade =
        role.matchPercent >= 80 ? 'Excellent fit' :
        role.matchPercent >= 60 ? 'Good fit' :
        role.matchPercent >= 40 ? 'Partial fit' : 'Needs work';

    return (
        <Box
            onClick={() => setExpanded(!expanded)}
            sx={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.065)',
                borderRadius: '16px',
                p: 2.5,
                cursor: 'pointer',
                transition: 'all 0.22s',
                animation: `fadeUp 0.4s ease both`,
                animationDelay: `${index * 0.07}s`,
                '&:hover': {
                    borderColor: 'rgba(255,255,255,0.14)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
                },
            }}
        >
            {/* Header row */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                        <WorkOutlineIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.45)' }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', lineHeight: 1.2 }}>
                            {role.title}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', mt: 0.2 }}>
                            {role.salary}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                    <Typography sx={{ fontSize: '1.75rem', fontWeight: 900, color: role.matchPercent >= 60 ? '#fff' : 'rgba(255,255,255,0.4)', letterSpacing: '-0.05em', lineHeight: 1 }}>
                        {role.matchPercent}%
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', mt: 0.2 }}>
                        match
                    </Typography>
                </Box>
            </Box>

            {/* Progress bar */}
            <LinearProgress
                variant="determinate"
                value={role.matchPercent}
                sx={{ mb: 1.5, height: 4, borderRadius: 99 }}
            />

            {/* Chips row */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                <Chip
                    label={grade}
                    size="small"
                    sx={{ height: 19, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <Chip
                    label={`Demand: ${role.demand}`}
                    size="small"
                    sx={{ height: 19, fontSize: '0.65rem', fontWeight: 700, background: 'rgba(255,255,255,0.03)', color: DEMAND_COLOR[role.demand] ?? 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
                <Box sx={{ ml: 'auto', color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', transition: 'transform 0.22s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
                    <ExpandMoreIcon sx={{ fontSize: 18 }} />
                </Box>
            </Box>

            {/* Expandable skills detail */}
            <Collapse in={expanded}>
                <Box sx={{ pt: 1.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Box sx={{ mb: 1.5 }}>
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1 }}>
                            You have
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                            {role.matchedSkills.map((s) => (
                                <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CheckCircleOutlineIcon sx={{ fontSize: 11, color: 'rgba(74,222,128,0.55)' }} />
                                    <Typography sx={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.55)' }}>{s}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    {role.missingSkills.length > 0 && (
                        <Box>
                            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1 }}>
                                Still needed
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                                {role.missingSkills.map((s) => (
                                    <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <RadioButtonUncheckedIcon sx={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }} />
                                        <Typography sx={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.3)' }}>{s}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
}
