import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

export interface ATSPillarData {
    pillar: string;
    label: string;
    score: number;
    fullMark: number;
    status: 'optimal' | 'moderate' | 'risk';
    description: string;
    icon: string;
}

interface ATSBalanceRadarProps {
    data: ATSPillarData[];
    overallScore?: number;
}

export default function ATSBalanceRadar({ data, overallScore }: ATSBalanceRadarProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);

    const size = 300;
    const center = size / 2;
    const radius = 100;
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

    const defaultPillars: ATSPillarData[] = [
        { pillar: 'Formatting', label: 'Layout & Formatting', score: 95, fullMark: 100, status: 'optimal', description: 'Single column, clean hierarchy, no unparseable tables', icon: '📐' },
        { pillar: 'Sections', label: 'Standard Sections', score: 90, fullMark: 100, status: 'optimal', description: 'All core ATS header sections detected and categorized', icon: '📋' },
        { pillar: 'Dates', label: 'Date Parseability', score: 85, fullMark: 100, status: 'optimal', description: 'Consistent Month Year / ISO timeline format', icon: '📅' },
        { pillar: 'Keywords', label: 'Keyword Density', score: 80, fullMark: 100, status: 'optimal', description: 'High technical keyword overlap against industry role benchmarks', icon: '🔍' },
        { pillar: 'Integrity', label: 'Encoding Integrity', score: 100, fullMark: 100, status: 'optimal', description: '100% clean UTF-8 plain text without corrupted glyphs', icon: '🔒' },
    ];

    const activeData = data && data.length === 5 ? data : defaultPillars;
    const totalPillars = activeData.length;

    // Calculate coordinates for polygon at a given percentage level
    const getPolygonPoints = (scale = 1.0) => {
        return activeData.map((_, i) => {
            const angle = (Math.PI * 2 / totalPillars) * i - Math.PI / 2;
            const r = radius * scale;
            const x = center + r * Math.cos(angle);
            const y = center + r * Math.sin(angle);
            return `${x.toFixed(1)},${y.toFixed(1)}`;
        }).join(' ');
    };

    // Calculate actual score polygon points
    const dataPoints = activeData.map((d, i) => {
        const angle = (Math.PI * 2 / totalPillars) * i - Math.PI / 2;
        const normalized = Math.max(10, Math.min(100, d.score)) / 100;
        const r = radius * normalized;
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return { x, y, angle, ...d };
    });

    const dataPolygonPoints = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find nearest vertex spoke
        let closestIdx = 0;
        let minDist = Infinity;
        dataPoints.forEach((p, idx) => {
            const dist = Math.hypot(x - p.x, y - p.y);
            if (dist < minDist) {
                minDist = dist;
                closestIdx = idx;
            }
        });

        if (minDist < 60) {
            setHoveredIndex(closestIdx);
        } else {
            setHoveredIndex(null);
        }
    };

    const handleMouseLeave = () => {
        setHoveredIndex(null);
    };

    const activeHovered = hoveredIndex !== null ? activeData[hoveredIndex] : null;

    return (
        <Box sx={{ width: '100%', position: 'relative' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 280, position: 'relative' }}>
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${size} ${size}`}
                    style={{ width: '100%', maxWidth: '300px', height: '280px', overflow: 'visible', cursor: 'crosshair' }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <defs>
                        {/* Monochrome glowing polygon gradient */}
                        <radialGradient id="monoRadarGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.28)" />
                            <stop offset="70%" stopColor="rgba(255, 255, 255, 0.12)" />
                            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.03)" />
                        </radialGradient>

                        {/* Vertex glow filter */}
                        <filter id="radarVertexGlowMono" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Concentric Grid Pentagons */}
                    {levels.map((lvl, idx) => (
                        <polygon
                            key={`grid-${idx}`}
                            points={getPolygonPoints(lvl)}
                            fill="none"
                            stroke={idx === levels.length - 1 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}
                            strokeWidth={idx === levels.length - 1 ? '1.5' : '1'}
                            strokeDasharray={idx === levels.length - 1 ? 'none' : '3 3'}
                        />
                    ))}

                    {/* Axis Spoke Lines */}
                    {activeData.map((_, i) => {
                        const angle = (Math.PI * 2 / totalPillars) * i - Math.PI / 2;
                        const x2 = center + radius * Math.cos(angle);
                        const y2 = center + radius * Math.sin(angle);
                        const isHovered = hoveredIndex === i;
                        return (
                            <line
                                key={`spoke-${i}`}
                                x1={center}
                                y1={center}
                                x2={x2}
                                y2={y2}
                                stroke={isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)'}
                                strokeWidth={isHovered ? '1.8' : '1'}
                                style={{ transition: 'stroke 0.2s ease, stroke-width 0.2s ease' }}
                            />
                        );
                    })}

                    {/* Filled Data Polygon */}
                    <polygon
                        points={dataPolygonPoints}
                        fill="url(#monoRadarGlow)"
                        stroke="rgba(255, 255, 255, 0.9)"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        style={{
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.2))',
                        }}
                    />

                    {/* Vertex Data Points */}
                    {dataPoints.map((p, i) => {
                        const isHovered = hoveredIndex === i;
                        return (
                            <g key={`point-${i}`}>
                                {isHovered && (
                                    <circle
                                        cx={p.x}
                                        cy={p.y}
                                        r="12"
                                        fill="rgba(255,255,255,0.15)"
                                    />
                                )}
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r={isHovered ? '5.5' : '4'}
                                    fill="#ffffff"
                                    stroke="#0a0a0a"
                                    strokeWidth="2"
                                    filter={isHovered ? 'url(#radarVertexGlowMono)' : undefined}
                                    style={{
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                />
                            </g>
                        );
                    })}

                    {/* Outer Spoke Labels with Icons */}
                    {activeData.map((d, i) => {
                        const angle = (Math.PI * 2 / totalPillars) * i - Math.PI / 2;
                        const labelRadius = radius + 26;
                        const lx = center + labelRadius * Math.cos(angle);
                        const ly = center + labelRadius * Math.sin(angle);
                        const isHovered = hoveredIndex === i;

                        let textAnchor: 'middle' | 'start' | 'end' = 'middle';
                        if (Math.cos(angle) > 0.3) textAnchor = 'start';
                        else if (Math.cos(angle) < -0.3) textAnchor = 'end';

                        return (
                            <text
                                key={`label-${i}`}
                                x={lx}
                                y={ly + 4}
                                textAnchor={textAnchor}
                                fill={isHovered ? '#ffffff' : 'rgba(255,255,255,0.65)'}
                                fontSize="11"
                                fontWeight={isHovered ? 800 : 600}
                                style={{
                                    transition: 'fill 0.2s ease, font-weight 0.2s ease',
                                    userSelect: 'none',
                                }}
                            >
                                {d.pillar}
                            </text>
                        );
                    })}
                </svg>

                {/* Center Balance Badge */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        textAlign: 'center',
                    }}
                >
                    <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Balance
                    </Typography>
                    <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                        {overallScore ?? Math.round(activeData.reduce((acc, curr) => acc + curr.score, 0) / activeData.length)}%
                    </Typography>
                </Box>
            </Box>

            {/* Interactive Hover Detail Box */}
            <Box sx={{
                mt: 1,
                p: 1.5,
                borderRadius: '12px',
                background: activeHovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${activeHovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}`,
                transition: 'all 0.2s ease',
                minHeight: '62px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                {activeHovered ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                            <Typography sx={{ fontSize: '1.2rem' }}>{activeHovered.icon}</Typography>
                            <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff' }}>
                                    {activeHovered.label}
                                </Typography>
                                <Typography sx={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.5)' }}>
                                    {activeHovered.description}
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Chip
                                label={`${activeHovered.score}/100`}
                                size="small"
                                sx={{
                                    background: 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    fontWeight: 800,
                                    fontSize: '0.72rem',
                                    height: 22,
                                }}
                            />
                        </Box>
                    </Box>
                ) : (
                    <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', width: '100%' }}>
                        Hover over any pillar spoke to inspect diagnostic rating & ATS criteria.
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
