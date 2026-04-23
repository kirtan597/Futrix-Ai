import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';

import theme from './theme';
import Sidebar from './components/Sidebar';

import Login        from './pages/Login';
import UploadResume from './pages/UploadResume';
import Dashboard    from './pages/Dashboard';
import ResumeResult from './pages/ResumeResult';
import SkillsGap    from './pages/SkillsGap';
import CareerPath   from './pages/CareerPath';
import History      from './pages/History';
import Profile      from './pages/Profile';

// ─── Token validity check (checks expiry without a library) ──────────────────
function isTokenValid(): boolean {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}

// ─── Route Guard ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: JSX.Element }) {
    if (!isTokenValid()) {
        localStorage.removeItem('accessToken');
        return <Navigate to="/login" replace />;
    }
    return children;
}

// ─── Redirect logged-in users away from /login ───────────────────────────────
function GuestRoute({ children }: { children: JSX.Element }) {
    if (isTokenValid()) return <Navigate to="/dashboard" replace />;
    return children;
}

// ─── App Shell ────────────────────────────────────────────────────────────────
function AppShell({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    if (location.pathname === '/login') return <>{children}</>;
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
            <Sidebar />
            <Box component="main" sx={{ flex: 1, minWidth: 0, overflowY: 'auto', overflowX: 'hidden' }}>
                {children}
            </Box>
        </Box>
    );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
    return (
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
    );
}
