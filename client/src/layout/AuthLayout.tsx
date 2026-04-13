import Box from '@mui/material/Box';

interface AuthLayoutProps {
    children: React.ReactNode;
}

/**
 * AuthLayout — centered card wrapper for unauthenticated pages (Login, etc.)
 * Full viewport, dark background, content centered.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0a0a0a',
            px: 2,
        }}>
            {children}
        </Box>
    );
}
