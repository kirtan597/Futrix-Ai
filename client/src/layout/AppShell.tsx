import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Sidebar from '../components/Sidebar';

interface AppShellProps {
    children: React.ReactNode;
}

/**
 * AppShell — persistent sidebar + scrollable main content area.
 * Used for all authenticated pages.
 * Mobile: Adds padding for top bar and bottom navigation
 */
export default function AppShell({ children }: AppShellProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flex: 1,
                    minWidth: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    // Mobile: Add padding for top bar and bottom nav
                    ...(isMobile && {
                        paddingTop: '56px', // Top mobile header
                        paddingBottom: 'calc(64px + env(safe-area-inset-bottom))', // Bottom nav + safe area
                    }),
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
