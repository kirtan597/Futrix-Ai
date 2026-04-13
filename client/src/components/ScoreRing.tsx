import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ScoreRingProps {
    score: number;
    size?: number;
    strokeWidth?: number;
    animated?: boolean;
}

export default function ScoreRing({ score, size = 160, strokeWidth = 10, animated = true }: ScoreRingProps) {
    const r = (size / 2) - strokeWidth;
    const circ = 2 * Math.PI * r;
    const circleRef = useRef<SVGCircleElement>(null);

    // Grade color in grayscale
    const color = score >= 80 ? '#ffffff' :
                  score >= 60 ? '#d4d4d4' :
                  score >= 40 ? '#737373' : '#525252';

    const label = score >= 80 ? 'Excellent' :
                  score >= 60 ? 'Good' :
                  score >= 40 ? 'Fair' : 'Developing';

    const offset = ((100 - score) / 100) * circ;

    useEffect(() => {
        if (!circleRef.current) return;
        const el = circleRef.current;
        // Start from full offset (empty), animate to target
        el.style.strokeDashoffset = String(circ);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                el.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)';
                el.style.strokeDashoffset = String(offset);
            });
        });
    }, [score, circ, offset]);

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Glow filter */}
                <defs>
                    <filter id="ring-glow">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Track */}
                <circle
                    cx={size/2} cy={size/2} r={r}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress */}
                <circle
                    ref={circleRef}
                    cx={size/2} cy={size/2} r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={animated ? circ : offset}
                    filter="url(#ring-glow)"
                />
            </svg>
            {/* Center content */}
            <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography sx={{
                    fontSize: '2.2rem',
                    fontWeight: 900,
                    color,
                    lineHeight: 1,
                    letterSpacing: '-0.05em',
                }}>
                    {score}
                </Typography>
                <Typography sx={{
                    fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.35)',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    mt: 0.4,
                }}>
                    {label}
                </Typography>
            </Box>
        </Box>
    );
}
