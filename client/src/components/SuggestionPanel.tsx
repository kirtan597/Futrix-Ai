import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';

import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarOutlineIcon from '@mui/icons-material/StarOutline';

export interface Suggestion {
    title: string;
    body: string;
    priority?: 'high' | 'medium' | 'low';
}

interface SuggestionPanelProps {
    suggestions: Suggestion[];
    title?: string;
}

const PRIORITY_DOT: Record<string, string> = {
    high:   'rgba(248,113,113,0.7)',
    medium: 'rgba(251,191,36,0.7)',
    low:    'rgba(163,163,163,0.5)',
};

export default function SuggestionPanel({ suggestions, title = 'AI Suggestions' }: SuggestionPanelProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <Box>
            {/* Panel header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LightbulbOutlinedIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.35)' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
                    {title}
                </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            {suggestions.map((s, i) => {
                const isOpen = openIndex === i;
                return (
                    <Box
                        key={i}
                        sx={{
                            mb: 1.2,
                            background: isOpen ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.055)'}`,
                            borderRadius: '12px',
                            overflow: 'hidden',
                            transition: 'all 0.22s',
                        }}
                    >
                        {/* Accordion trigger */}
                        <Box
                            onClick={() => setOpenIndex(isOpen ? null : i)}
                            sx={{
                                display: 'flex', alignItems: 'center', gap: 1.5,
                                p: 1.8, cursor: 'pointer',
                                '&:hover': { background: 'rgba(255,255,255,0.02)' },
                            }}
                        >
                            {s.priority ? (
                                <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: PRIORITY_DOT[s.priority] ?? PRIORITY_DOT.low, flexShrink: 0 }} />
                            ) : (
                                <StarOutlineIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                            )}
                            <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', flex: 1 }}>
                                {s.title}
                            </Typography>
                            <Box sx={{ color: 'rgba(255,255,255,0.22)', transition: 'transform 0.22s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                                <ExpandMoreIcon sx={{ fontSize: 18 }} />
                            </Box>
                        </Box>

                        {/* Body */}
                        <Collapse in={isOpen}>
                            <Box sx={{ px: 2.5, pb: 2, pt: 0 }}>
                                <Divider sx={{ mb: 1.5 }} />
                                <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
                                    {s.body}
                                </Typography>
                            </Box>
                        </Collapse>
                    </Box>
                );
            })}
        </Box>
    );
}
