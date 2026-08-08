import React, { Component, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import theme from './theme';
import Sidebar from './components/Sidebar';
import { useAuth } from './store/useAuth';

import Login        from './pages/Login';
import UploadResume from './pages/UploadResume';
import Dashboard    from './pages/Dashboard';
import ResumeResult from './pages/ResumeResult';
import SkillsGap    from './pages/SkillsGap';
import CareerPath   from './pages/CareerPath';
import History      from './pages/History';
import Profile      from './pages/Profile';

// ─── Error Boundary ───────────────────────────────────────────────────────────
interface ErrorBoundaryState { hasError: boolean; error: Error | null }
class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false, error: null };
    static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
    componentDidCatch(error: Error, info: React.ErrorInfo) { console.error('[ErrorBoundary]', error, info); }
    render() {
        if (this.state.hasError) {
            return (
                <Box sx={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0a0a0a', gap:2 }}>
                    <Typography sx={{ color:'#fff', fontWeight:700, fontSize:'1.2rem' }}>Something went wrong</Typography>
                    <Typography sx={{ color:'rgba(255,255,255,0.4)', fontSize:'0.85rem' }}>{this.state.error?.message}</Typography>
                    <Button variant="outlined" onClick={() => { this.setState({ hasError:false, error:null }); window.location.href = '/login'; }}>
                        Back to Login
                    </Button>
                </Box>
            );
        }
        return this.props.children;
    }
}

// ─── Route Guard ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

// ─── Redirect logged-in users away from /login ───────────────────────────────
function GuestRoute({ children }: { children: JSX.Element }) {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated()) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function AppShell({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

    if (location.pathname === '/login') return <>{children}</>;

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
                    pt: isMobile ? '56px' : 0,
                    pb: isMobile ? '72px' : 0,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <AppShell>
                        <Routes>
                            <Route path="/"            element={<Navigate to="/login" replace />} />
                            <Route path="/login"       element={<GuestRoute><Login /></GuestRoute>} />
                            <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/upload"      element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
                            <Route path="/result"      element={<ProtectedRoute><ResumeResult /></ProtectedRoute>} />
                            <Route path="/skills-gap"  element={<ProtectedRoute><SkillsGap /></ProtectedRoute>} />
                            <Route path="/career-path" element={<ProtectedRoute><CareerPath /></ProtectedRoute>} />
                            <Route path="/history"     element={<ProtectedRoute><History /></ProtectedRoute>} />
                            <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="*"            element={<Navigate to="/login" replace />} />
                        </Routes>
                    </AppShell>
                </Router>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
