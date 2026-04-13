import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';

import theme from './theme';
import Sidebar from './components/Sidebar';

import Login       from './pages/Login';
import UploadResume from './pages/UploadResume';
import Dashboard   from './pages/Dashboard';
import ResumeResult from './pages/ResumeResult';
import SkillsGap   from './pages/SkillsGap';
import CareerPath  from './pages/CareerPath';
import History     from './pages/History';
import Profile     from './pages/Profile';

// ─── Route Guard ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// ─── App Shell (sidebar + content) ───────────────────────────────────────────
function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuth = location.pathname === '/login';
  if (isAuth) return <>{children}</>;

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

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppShell>
          <Routes>
            <Route path="/"           element={<Navigate to="/login" replace />} />
            <Route path="/login"      element={<Login />} />
            <Route path="/upload"     element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
            <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/result"     element={<ProtectedRoute><ResumeResult /></ProtectedRoute>} />
            <Route path="/skills-gap" element={<ProtectedRoute><SkillsGap /></ProtectedRoute>} />
            <Route path="/career-path"element={<ProtectedRoute><CareerPath /></ProtectedRoute>} />
            <Route path="/history"    element={<ProtectedRoute><History /></ProtectedRoute>} />
            <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="*"           element={<Navigate to="/login" replace />} />
          </Routes>
        </AppShell>
      </Router>
    </ThemeProvider>
  );
}
