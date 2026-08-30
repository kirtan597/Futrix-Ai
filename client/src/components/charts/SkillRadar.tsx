import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface SkillRadarProps {
    skills?: string[];
    gapSkills?: string[];
}

export default function SkillRadar({ skills = [], gapSkills = [] }: SkillRadarProps) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const sLower = (skills || []).map(x => x.toLowerCase());
    const gLower = (gapSkills || []).map(x => x.toLowerCase());

    const hasFe = sLower.some(s => ['react', 'vue', 'angular', 'typescript', 'javascript', 'html', 'css'].includes(s));
    const hasBe = sLower.some(s => ['node.js', 'python', 'java', 'go', 'django', 'flask', 'fastapi'].includes(s));
    const hasCloud = sLower.some(s => ['aws', 'azure', 'gcp', 'cloud'].includes(s));
    const hasDevOps = sLower.some(s => ['docker', 'kubernetes', 'ci/cd', 'linux'].includes(s));
    const hasData = sLower.some(s => ['postgresql', 'mongodb', 'mysql', 'redis', 'sql'].includes(s));

    const gapHasCloud = gLower.some(g => ['aws', 'azure', 'gcp', 'cloud'].includes(g));
    const gapHasDevOps = gLower.some(g => ['docker', 'kubernetes', 'ci/cd', 'linux'].includes(g));

    const axes = [
        { label: 'Frontend',     value: hasFe ? 85 : 45 },
        { label: 'Backend',      value: hasBe ? 90 : 50 },
        { label: 'Cloud Infra',  value: hasCloud ? 80 : gapHasCloud ? 35 : 55 },
        { label: 'DevOps / CI',  value: hasDevOps ? 85 : gapHasDevOps ? 35 : 55 },
        { label: 'Databases',    value: hasData ? 85 : 45 },
    ];

    const W = 280;
    const H = 220;
    const CX = W / 2;
    const CY = 105;
    const R = 72;
    const numAxes = axes.length;

    const angle = (i: number) => (i * 2 * Math.PI) / numAxes - Math.PI / 2;

    const getCoord = (i: number, valPercent: number) => {
        const a = angle(i);
        const dist = (valPercent / 100) * R;
        return {
            x: CX + dist * Math.cos(a),
            y: CY + dist * Math.sin(a),
        };
    };

    const gridLevels = [0.25, 0.5, 0.75, 1.0];
    const gridPolygons = gridLevels.map(level => {
        return Array.from({ length: numAxes }).map((_, i) => {
            const a = angle(i);
            const dist = level * R;
            return `${CX + dist * Math.cos(a)},${CY + dist * Math.sin(a)}`;
        }).join(' ');
    });

    const dataPoints = axes.map((d, i) => getCoord(i, d.value));
    const dataPolygonD = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * W;
        const mouseY = ((e.clientY - rect.top) / rect.height) * H;

        let closestIdx = 0;
        let minDist = Infinity;
        dataPoints.forEach((p, idx) => {
            const dist = Math.hypot(p.x - mouseX, p.y - mouseY);
            if (dist < minDist) {
                minDist = dist;
                closestIdx = idx;
            }
        });
        if (minDist < 60) {
            setHoveredIdx(closestIdx);
        } else {
            setHoveredIdx(null);
        }
    };

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        }}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                style={{ width: '100%', height: '100%', maxHeight: 220, overflow: 'visible', cursor: 'pointer' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredIdx(null)}
            >
                <defs>
                    <radialGradient id="radarFillGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.22)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
                    </radialGradient>
                    <filter id="radarVertexGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Concentric Grid Web */}
                {gridPolygons.map((pointsStr, idx) => (
                    <polygon
                        key={idx}
                        points={pointsStr}
                        fill={idx === gridPolygons.length - 1 ? 'rgba(255, 255, 255, 0.02)' : 'none'}
                        stroke="rgba(255, 255, 255, 0.07)"
                        strokeWidth={1}
                    />
                ))}

                {/* Spokes from Center */}
                {Array.from({ length: numAxes }).map((_, i) => {
                    const outer = getCoord(i, 100);
                    const isSpokeHovered = hoveredIdx === i;
                    return (
                        <line
                            key={i}
                            x1={CX}
                            y1={CY}
                            x2={outer.x}
                            y2={outer.y}
                            stroke={isSpokeHovered ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}
                            strokeWidth={isSpokeHovered ? 1.5 : 1}
                            style={{ transition: 'all 0.2s ease' }}
                        />
                    );
                })}

                {/* Filled Radar Polygon with Smooth Hover Response */}
                <polygon
                    points={dataPolygonD}
                    fill="url(#radarFillGrad)"
                    stroke="rgba(255, 255, 255, 0.85)"
                    strokeWidth={1.8}
                    style={{ transition: 'all 0.3s ease' }}
                />

                {/* Spoke Axis Labels */}
                {axes.map((axis, i) => {
                    const outer = getCoord(i, 126);
                    const isHovered = hoveredIdx === i;
                    return (
                        <text
                            key={i}
                            x={outer.x}
                            y={outer.y + 3}
                            textAnchor="middle"
                            fill={isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.45)'}
                            fontSize={isHovered ? 10.5 : 9.5}
                            fontWeight={isHovered ? 800 : 500}
                            fontFamily="Inter, sans-serif"
                            style={{ transition: 'all 0.15s ease' }}
                        >
                            {axis.label}
                        </text>
                    );
                })}

                {/* Active Spoke Highlight Beam */}
                {hoveredIdx !== null && (
                    <circle
                        cx={dataPoints[hoveredIdx].x}
                        cy={dataPoints[hoveredIdx].y}
                        r={9}
                        fill="rgba(255, 255, 255, 0.2)"
                        filter="url(#radarVertexGlow)"
                    />
                )}

                {/* Data Points */}
                {dataPoints.map((p, i) => {
                    const isHovered = hoveredIdx === i;
                    return (
                        <g key={i}>
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={isHovered ? 5.5 : 3.5}
                                fill={isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'}
                                stroke="#0a0a0a"
                                strokeWidth={isHovered ? 2 : 1.5}
                                style={{ transition: 'all 0.15s ease' }}
                            />
                        </g>
                    );
                })}

                {/* Floating Interactive Tooltip */}
                {hoveredIdx !== null && (
                    <g transform={`translate(${CX}, ${CY - 14})`}>
                        <rect
                            x={-60}
                            y={-14}
                            width={120}
                            height={26}
                            rx={6}
                            fill="#141414"
                            stroke="rgba(255, 255, 255, 0.25)"
                            strokeWidth={1}
                        />
                        <text
                            x={0}
                            y={3}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={10.5}
                            fontWeight="800"
                            fontFamily="Inter, sans-serif"
                        >
                            {axes[hoveredIdx].label}: {axes[hoveredIdx].value}%
                        </text>
                    </g>
                )}
            </svg>
            <Typography sx={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mt: 0.5 }}>
                Skill Proficiency Radar
            </Typography>
        </Box>
    );
}
