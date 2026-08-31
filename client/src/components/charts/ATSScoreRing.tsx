import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ATSScoreRingProps {
    score: number;
    size?: number;
}

export default function ATSScoreRing({ score, size = 160 }: ATSScoreRingProps) {
    const strokeWidth = 8;
    const center = size / 2;
    const radius = center - strokeWidth - 6;
    const circumference = 2 * Math.PI * radius;
    const clampedScore = Math.max(0, Math.min(100, score));
    const offset = circumference - (clampedScore / 100) * circumference;

    const scoreLabel = clampedScore >= 80 ? 'Optimal'
        : clampedScore >= 60 ? 'Moderate'
            : clampedScore >= 40 ? 'Review'
                : 'Attention';

    return (
        <Box sx={{ position: 'relative', width: size, height: size, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id="monoRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.45)" />
                        <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                    <filter id="monoRingGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Track Circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.07)"
                    strokeWidth={strokeWidth}
                />

                {/* Progress Arc */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="url(#monoRingGradient)"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${center} ${center})`}
                    filter="url(#monoRingGlow)"
                    style={{
                        transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                />
            </svg>

            {/* Inner Center Text */}
            <Box sx={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
                <Typography sx={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {clampedScore}
                </Typography>
                <Typography sx={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', mt: 0.2 }}>
                    ATS Index
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.85)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {scoreLabel}
                </Typography>
            </Box>
        </Box>
    );
}
