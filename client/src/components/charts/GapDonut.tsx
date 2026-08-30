import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface GapDonutProps {
    skillsCount: number;
    gapCount: number;
}

export default function GapDonut({ skillsCount = 0, gapCount = 0 }: GapDonutProps) {
    const [hovered, setHovered] = useState<'detected' | 'gaps' | null>(null);

    const safeSkills = Math.max(0, skillsCount);
    const safeGaps = Math.max(0, gapCount);
    const total = safeSkills + safeGaps || 1;

    const detectedPct = Math.round((safeSkills / total) * 100);
    const gapPct = 100 - detectedPct;

    const size = 154;
    const center = size / 2;
    const strokeWidth = 16;
    const radius = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * radius;

    const detectedOffset = circ * (1 - safeSkills / total);

    return (
        <Box sx={{
            width: '100%',
            height: '100%',
            minHeight: 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        }}>
            {/* SVG Donut Ring */}
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
                    <defs>
                        <filter id="donutGlow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background Track / Gap Arc */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={hovered === 'gaps' ? 'rgba(255, 255, 255, 0.28)' : 'rgba(255, 255, 255, 0.12)'}
                        strokeWidth={hovered === 'gaps' ? strokeWidth + 3 : strokeWidth}
                        style={{
                            cursor: 'pointer',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onMouseEnter={() => setHovered('gaps')}
                        onMouseLeave={() => setHovered(null)}
                    />

                    {/* Detected Skills Segment */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth={hovered === 'detected' ? strokeWidth + 4 : strokeWidth}
                        strokeDasharray={circ}
                        strokeDashoffset={detectedOffset}
                        strokeLinecap="round"
                        filter={hovered === 'detected' ? 'url(#donutGlow)' : undefined}
                        style={{
                            transition: 'stroke-dashoffset 1s ease, stroke-width 0.25s ease, stroke 0.2s',
                            cursor: 'pointer',
                        }}
                        onMouseEnter={() => setHovered('detected')}
                        onMouseLeave={() => setHovered(null)}
                    />
                </svg>

                {/* Center Percentage */}
                <Box sx={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none', transition: 'transform 0.2s ease', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}>
                    <Typography sx={{
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        color: '#fff',
                        lineHeight: 1,
                        letterSpacing: '-0.04em',
                    }}>
                        {hovered === 'gaps' ? `${gapPct}%` : `${detectedPct}%`}
                    </Typography>
                    <Typography sx={{
                        fontSize: '0.62rem',
                        color: hovered ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.35)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        mt: 0.3,
                        transition: 'color 0.2s',
                    }}>
                        {hovered === 'gaps' ? 'Gaps' : 'Coverage'}
                    </Typography>
                </Box>
            </Box>

            {/* Micro Legend with Interactive Hover Linkage */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.7,
                        cursor: 'pointer',
                        p: '4px 8px',
                        borderRadius: '6px',
                        background: hovered === 'detected' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                        transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={() => setHovered('detected')}
                    onMouseLeave={() => setHovered(null)}
                >
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: '#ffffff' }} />
                    <Typography sx={{ fontSize: '0.72rem', color: hovered === 'detected' ? '#fff' : 'rgba(255, 255, 255, 0.65)', fontWeight: 700 }}>
                        {safeSkills} Detected ({detectedPct}%)
                    </Typography>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.7,
                        cursor: 'pointer',
                        p: '4px 8px',
                        borderRadius: '6px',
                        background: hovered === 'gaps' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                        transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={() => setHovered('gaps')}
                    onMouseLeave={() => setHovered(null)}
                >
                    <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: 'rgba(255, 255, 255, 0.28)' }} />
                    <Typography sx={{ fontSize: '0.72rem', color: hovered === 'gaps' ? '#fff' : 'rgba(255, 255, 255, 0.35)', fontWeight: 700 }}>
                        {safeGaps} Gaps ({gapPct}%)
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
