import { useState, useRef } from 'react';
import Box from '@mui/material/Box';

interface ScoreAreaProps {
    currentScore: number;
}

const HISTORICAL = [
    { label: 'Jan', score: 42, month: 'January Baseline' },
    { label: 'Feb', score: 51, month: 'February Review' },
    { label: 'Mar', score: 58, month: 'March Upskill' },
    { label: 'Apr', score: 63, month: 'April Project Build' },
    { label: 'May', score: 72, month: 'May System Design' },
];

export default function ScoreArea({ currentScore = 0 }: ScoreAreaProps) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const safeScore = Math.max(0, Math.min(100, Math.round(currentScore || 78)));
    const data = [
        ...HISTORICAL,
        { label: 'Now', score: safeScore > 0 ? safeScore : 78, month: 'Current Evaluation' },
    ];

    const W = 420;
    const H = 190;
    const PAD_L = 36;
    const PAD_R = 24;
    const PAD_T = 22;
    const PAD_B = 32;

    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    const points = data.map((d, i) => {
        const x = PAD_L + (i / (data.length - 1)) * plotW;
        const y = PAD_T + (1 - d.score / 100) * plotH;
        return { ...d, x, y };
    });

    // Create smooth curved monotone path
    const pathD = points.reduce((acc, p, i, arr) => {
        if (i === 0) return `M ${p.x},${p.y}`;
        const prev = arr[i - 1];
        const cx1 = prev.x + (p.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (p.x - prev.x) / 2;
        const cy2 = p.y;
        return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${p.x},${p.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x},${H - PAD_B} L ${points[0].x},${H - PAD_B} Z`;

    const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * W;

        // Find nearest point
        let closestIdx = 0;
        let minDist = Infinity;
        points.forEach((p, idx) => {
            const dist = Math.abs(p.x - mouseX);
            if (dist < minDist) {
                minDist = dist;
                closestIdx = idx;
            }
        });
        setHoveredIdx(closestIdx);
    };

    return (
        <Box sx={{ width: '100%', height: '100%', minHeight: 200, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                style={{ width: '100%', height: '100%', maxHeight: 210, overflow: 'visible', cursor: 'crosshair' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredIdx(null)}
            >
                <defs>
                    <linearGradient id="scoreAreaGradAnim" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.32)" />
                        <stop offset="50%" stopColor="rgba(255, 255, 255, 0.08)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0.0)" />
                    </linearGradient>

                    <linearGradient id="lineGlowGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.5)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0.95)" />
                    </linearGradient>

                    <filter id="pointPulse" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 25, 50, 75, 100].map((level) => {
                    const y = PAD_T + (1 - level / 100) * plotH;
                    return (
                        <g key={level}>
                            <line
                                x1={PAD_L}
                                y1={y}
                                x2={W - PAD_R}
                                y2={y}
                                stroke="rgba(255, 255, 255, 0.05)"
                                strokeDasharray="3 3"
                            />
                            <text
                                x={PAD_L - 8}
                                y={y + 3.5}
                                textAnchor="end"
                                fill="rgba(255, 255, 255, 0.25)"
                                fontSize={9.5}
                                fontFamily="Inter, sans-serif"
                            >
                                {level}
                            </text>
                        </g>
                    );
                })}

                {/* Shaded Area */}
                <path d={areaD} fill="url(#scoreAreaGradAnim)" style={{ transition: 'opacity 0.3s ease' }} />

                {/* Animated Monotone Line */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="url(#lineGlowGrad)"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                />

                {/* Vertical Tracker Beam on Cursor Move */}
                {activePoint && (
                    <g style={{ transition: 'all 0.15s ease' }}>
                        <line
                            x1={activePoint.x}
                            y1={PAD_T}
                            x2={activePoint.x}
                            y2={H - PAD_B}
                            stroke="rgba(255, 255, 255, 0.25)"
                            strokeWidth={1.2}
                            strokeDasharray="3 3"
                        />
                        <circle
                            cx={activePoint.x}
                            cy={activePoint.y}
                            r={10}
                            fill="rgba(255, 255, 255, 0.15)"
                            filter="url(#pointPulse)"
                        />
                    </g>
                )}

                {/* X Axis Month Labels */}
                {points.map((p, i) => {
                    const isHovered = hoveredIdx === i;
                    return (
                        <g key={i}>
                            <text
                                x={p.x}
                                y={H - PAD_B + 16}
                                textAnchor="middle"
                                fill={isHovered || i === points.length - 1 ? '#ffffff' : 'rgba(255, 255, 255, 0.38)'}
                                fontSize={isHovered ? 11 : 10}
                                fontWeight={isHovered || i === points.length - 1 ? 800 : 500}
                                fontFamily="Inter, sans-serif"
                                style={{ transition: 'all 0.15s ease' }}
                            >
                                {p.label}
                            </text>
                        </g>
                    );
                })}

                {/* Data Points */}
                {points.map((p, i) => {
                    const isHovered = hoveredIdx === i;
                    return (
                        <g key={i}>
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={isHovered ? 5.5 : 3.5}
                                fill={isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.85)'}
                                stroke="#0a0a0a"
                                strokeWidth={isHovered ? 2.5 : 1.5}
                                style={{ transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            />
                        </g>
                    );
                })}

                {/* Floating Interactive Tooltip following Cursor */}
                {activePoint && (
                    <g
                        transform={`translate(${Math.min(W - 65, Math.max(65, activePoint.x))}, ${Math.max(22, activePoint.y - 28)})`}
                        style={{ pointerEvents: 'none', transition: 'transform 0.15s ease' }}
                    >
                        <rect
                            x={-42}
                            y={-18}
                            width={84}
                            height={26}
                            rx={7}
                            fill="#141414"
                            stroke="rgba(255, 255, 255, 0.25)"
                            strokeWidth={1}
                        />
                        <text
                            x={0}
                            y={-1}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={11}
                            fontWeight="800"
                            fontFamily="Inter, sans-serif"
                        >
                            {activePoint.score}% Score
                        </text>
                    </g>
                )}
            </svg>
        </Box>
    );
}
