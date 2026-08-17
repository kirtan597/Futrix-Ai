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
 * Mobile: Adds padding for top bar and bottom navigation with safe-area support
 */
export default function AppShell({ children }: AppShellProps) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    return (
        <Box sx={{ 
            display: 'flex', 
            minHeight: '100dvh', // Dynamic viewport height
            height: '100dvh',
            background: '#0a0a0a',
            width: '100%',
            overflow: 'hidden',
        }}>
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    '-webkit-overflow-scrolling': 'touch',
                    // Mobile: Add padding for top bar and bottom nav
                    paddingTop: isMobile ? 'calc(56px + env(safe-area-inset-top))' : 0,
                    paddingBottom: isMobile ? 'calc(64px + env(safe-area-inset-bottom))' : 0,
                    // Desktop: standard padding
                    '@media (min-width: 960px)': {
                        paddingTop: 0,
                        paddingBottom: 0,
                    },
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
