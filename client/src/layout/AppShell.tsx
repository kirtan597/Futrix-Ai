import Box from '@mui/material/Box';
import Sidebar from '../components/Sidebar';

interface AppShellProps {
    children: React.ReactNode;
}

/**
 * AppShell — persistent sidebar + scrollable main content area.
 * Used for all authenticated pages.
 */
export default function AppShell({ children }: AppShellProps) {
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
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
