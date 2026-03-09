import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import BiotechIcon from '@mui/icons-material/Biotech';

import theme from './theme';
import Login from './pages/Login';
import UploadResume from './pages/UploadResume';
import Dashboard from './pages/Dashboard';

// ─── Route Guard ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('userEmail');

  if (location.pathname === '/login') return null;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="sticky" component="nav">
      <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, md: 3 }, minHeight: '68px !important' }}>

        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexGrow: 0, mr: 4 }}>
          <Box
            sx={{
              width: 34, height: 34, borderRadius: '9px',
              background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(14,109,205,0.35)',
            }}
          >
            <BiotechIcon sx={{ color: '#fff', fontSize: 18 }} />
          </Box>
          <Typography
            variant="h6"
            component={Link}
            to="/upload"
            sx={{
              color: 'primary.dark',
              fontWeight: 800,
              textDecoration: 'none',
              letterSpacing: '-0.03em',
              fontSize: '1.05rem',
              '& span': {
                background: 'linear-gradient(135deg, #0e6dcd, #00b4ea)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              },
            }}
          >
            Career<span>Twin</span> AI
          </Typography>
        </Box>

        {/* Nav Links */}
        <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
          {[
            { path: '/upload', label: 'Resume' },
            { path: '/dashboard', label: 'Dashboard' },
          ].map(({ path, label }) => (
            <Box
              key={path}
              component={Link}
              to={path}
              sx={{
                px: 2, py: 0.8,
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: isActive(path) ? 700 : 500,
                color: isActive(path) ? '#0e6dcd' : '#3a5a80',
                background: isActive(path) ? 'rgba(14,109,205,0.08)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.18s',
                '&:hover': {
                  color: '#0e6dcd',
                  background: 'rgba(14,109,205,0.06)',
                },
              }}
            >
              {label}
            </Box>
          ))}
        </Box>

        {/* User info + Logout */}
        {token && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={email}
              size="small"
              sx={{
                borderColor: '#c0d9f0',
                color: '#3a5a80',
                fontSize: '0.76rem',
                maxWidth: 200,
                background: '#f0f8ff',
                border: '1px solid #c0d9f0',
                fontWeight: 500,
              }}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleLogout}
              sx={{
                borderColor: '#c0d9f0',
                color: '#3a5a80',
                fontSize: '0.8rem',
                px: 2,
                borderRadius: '8px',
                '&:hover': {
                  borderColor: '#0e6dcd',
                  color: '#0e6dcd',
                  background: 'rgba(14,109,205,0.06)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
          <Navbar />
          <Box component="main" sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/upload" element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
