/**
 * FutrixLogo — Premium SVG logo mark for Futrix AI
 * A crisp, scalable circuit-brain icon that renders perfectly at any size.
 */
import { Box, type SxProps, type Theme } from '@mui/material';

interface FutrixLogoProps {
    size?: number;
    glow?: boolean;
    sx?: SxProps<Theme>;
}

export default function FutrixLogo({ size = 34, glow = false, sx }: FutrixLogoProps) {
    return (
        <Box
            sx={{
                width: size,
                height: size,
                borderRadius: `${Math.round(size * 0.24)}px`,
                background: 'linear-gradient(135deg, #ffffff 0%, #c0c0c0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: glow
                    ? '0 6px 24px rgba(255,255,255,0.15), 0 0 40px rgba(255,255,255,0.05)'
                    : '0 2px 10px rgba(255,255,255,0.08)',
                position: 'relative',
                overflow: 'hidden',
                '&::after': glow ? {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'inherit',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)',
                } : {},
                ...sx as any,
            }}
        >
            <svg
                width={Math.round(size * 0.62)}
                height={Math.round(size * 0.62)}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Main circuit-brain paths */}
                {/* Central vertical trunk */}
                <path
                    d="M12 2V6M12 10V14M12 18V22"
                    stroke="#0a0a0a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                />
                {/* Left branches */}
                <path
                    d="M12 6H7M7 6V4M7 6V9"
                    stroke="#0a0a0a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 14H6M6 14L4 12M6 14V17"
                    stroke="#0a0a0a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Right branches */}
                <path
                    d="M12 6H17M17 6V3M17 6L19 8"
                    stroke="#0a0a0a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 10H16M16 10L18 12M16 10V7"
                    stroke="#0a0a0a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 18H17M17 18V20M17 18L20 16"
                    stroke="#0a0a0a"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Circuit nodes (dots) */}
                <circle cx="12" cy="2" r="1.3" fill="#0a0a0a" />
                <circle cx="12" cy="22" r="1.3" fill="#0a0a0a" />
                <circle cx="7" cy="4" r="1.1" fill="#0a0a0a" />
                <circle cx="7" cy="9" r="1.1" fill="#0a0a0a" />
                <circle cx="4" cy="12" r="1.1" fill="#0a0a0a" />
                <circle cx="6" cy="17" r="1.1" fill="#0a0a0a" />
                <circle cx="17" cy="3" r="1.1" fill="#0a0a0a" />
                <circle cx="19" cy="8" r="1.1" fill="#0a0a0a" />
                <circle cx="18" cy="12" r="1.1" fill="#0a0a0a" />
                <circle cx="16" cy="7" r="1.1" fill="#0a0a0a" />
                <circle cx="17" cy="20" r="1.1" fill="#0a0a0a" />
                <circle cx="20" cy="16" r="1.1" fill="#0a0a0a" />
            </svg>
        </Box>
    );
}
