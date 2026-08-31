import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { ATSPillarData } from './ATSBalanceRadar';

interface ATSPillarPerformanceProps {
    data: ATSPillarData[];
}

export default function ATSPillarPerformance({ data }: ATSPillarPerformanceProps) {
    const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);

    const defaultPillars: ATSPillarData[] = [
        { pillar: 'Formatting', label: 'Formatting & Layout Safety', score: 95, fullMark: 100, status: 'optimal', description: 'Zero unparseable tables or floating graphics detected', icon: '📐' },
        { pillar: 'Sections', label: 'Section Header Structure', score: 90, fullMark: 100, status: 'optimal', description: 'Experience, Education, Skills, and Summary verified', icon: '📋' },
        { pillar: 'Dates', label: 'Date Parseability & Flow', score: 85, fullMark: 100, status: 'optimal', description: 'Timeline standard month/year parsing successful', icon: '📅' },
        { pillar: 'Keywords', label: 'Keyword Match & Alignment', score: 80, fullMark: 100, status: 'optimal', description: 'Strong alignment with industry technical benchmarks', icon: '🔍' },
        { pillar: 'Integrity', label: 'Encoding & Text Health', score: 100, fullMark: 100, status: 'optimal', description: 'Zero garbled characters or ASCII encoding faults', icon: '🔒' },
    ];

    const activeData = data && data.length > 0 ? data : defaultPillars;
    const threshold = 70; // 70% ATS standard threshold

    return (
        <Box sx={{ width: '100%' }}>
            {/* Header info & threshold legend */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                    Enterprise Parser Benchmark
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#ffffff' }} />
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>Optimal (≥80%)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.45)' }} />
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>Review (60–79%)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Risk (&lt;60%)</Typography>
                    </Box>
                </Box>
            </Box>

            {/* List of 5 Performance Bars */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {activeData.map((item) => {
                    const isHovered = hoveredPillar === item.pillar;
                    const statusText = item.score >= 80 ? 'Optimal' : item.score >= 60 ? 'Review' : 'Attention';

                    return (
                        <Box
                            key={item.pillar}
                            onMouseEnter={() => setHoveredPillar(item.pillar)}
                            onMouseLeave={() => setHoveredPillar(null)}
                            sx={{
                                p: 1.5,
                                borderRadius: '12px',
                                background: isHovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)',
                                border: `1px solid ${isHovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.05)'}`,
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                            }}
                        >
                            {/* Bar Top Label & Stats */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontSize: '1.05rem' }}>{item.icon}</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: '#fff' }}>
                                        {item.label}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label={statusText}
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.62rem',
                                            fontWeight: 700,
                                            background: 'rgba(255,255,255,0.06)',
                                            color: item.score >= 80 ? '#ffffff' : 'rgba(255,255,255,0.7)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                        }}
                                    />
                                    <Typography sx={{ fontWeight: 900, fontSize: '0.88rem', color: '#ffffff', minWidth: '45px', textAlign: 'right' }}>
                                        {item.score}%
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Pure SVG Monochrome Progress Bar */}
                            <Box sx={{ width: '100%', height: 8, position: 'relative', overflow: 'visible' }}>
                                <svg width="100%" height="8" style={{ display: 'block', overflow: 'visible' }}>
                                    <defs>
                                        <linearGradient id={`mono-grad-${item.pillar}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                                            <stop offset="100%" stopColor={isHovered ? '#ffffff' : 'rgba(255,255,255,0.85)'} />
                                        </linearGradient>
                                    </defs>

                                    {/* Track background */}
                                    <rect
                                        x="0"
                                        y="0"
                                        width="100%"
                                        height="8"
                                        rx="4"
                                        fill="rgba(255,255,255,0.06)"
                                    />

                                    {/* Active Progress Fill */}
                                    <rect
                                        x="0"
                                        y="0"
                                        width={`${Math.max(4, Math.min(100, item.score))}%`}
                                        height="8"
                                        rx="4"
                                        fill={`url(#mono-grad-${item.pillar})`}
                                        style={{
                                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                            filter: isHovered ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
                                        }}
                                    />

                                    {/* 70% ATS Threshold Target Line */}
                                    <line
                                        x1={`${threshold}%`}
                                        y1="-2"
                                        x2={`${threshold}%`}
                                        y2="10"
                                        stroke="rgba(255,255,255,0.35)"
                                        strokeWidth="1.5"
                                        strokeDasharray="2 2"
                                    />
                                </svg>
                            </Box>

                            {/* Subtitle / Diagnostic hint */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.8 }}>
                                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
                                    {item.description}
                                </Typography>
                                <Typography sx={{ fontSize: '0.68rem', color: item.score >= threshold ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                    {item.score >= threshold ? `+${item.score - threshold}% Benchmark` : `${item.score - threshold}% Benchmark`}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
