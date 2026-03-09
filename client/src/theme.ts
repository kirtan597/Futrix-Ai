import { createTheme } from '@mui/material/styles';

// ─── Ocean Blue + White Design System ────────────────────────────────────────
// Inspired by clean AI tech aesthetics: deep ocean navy, electric cyan accents,
// crisp white surfaces, and subtle glassmorphism.

const OCEAN = {
    deepest:  '#040f24',   // darkest navy (hero backgrounds)
    deep:     '#071730',   // deep ocean navy
    mid:      '#0a2548',   // mid ocean blue
    bright:   '#0e6dcd',   // bright royal blue
    electric: '#00b4ea',   // electric cyan accent
    aqua:     '#00d4ff',   // bright aqua highlight
    glow:     '#00e5ff',   // neon glow
    sky:      '#e8f4fd',   // very light sky blue tint
    pale:     '#f0f8ff',   // alice blue — nearly white
};

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0e6dcd',
            light: '#00b4ea',
            dark: '#071730',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#00b4ea',
            light: '#00d4ff',
            dark: '#0a2548',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f5faff',
            paper: '#ffffff',
        },
        text: {
            primary: '#071730',
            secondary: '#3a5a80',
        },
        divider: '#d0e6f7',
        success:  { main: '#00b894' },
        warning:  { main: '#f59e0b' },
        error:    { main: '#ef4444' },
        info:     { main: '#00b4ea' },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.03em' },
        h2: { fontWeight: 700, letterSpacing: '-0.025em' },
        h3: { fontWeight: 700, letterSpacing: '-0.02em' },
        h4: { fontWeight: 700, letterSpacing: '-0.015em' },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 500, letterSpacing: '-0.005em' },
        button: { fontWeight: 600, letterSpacing: '0.01em', textTransform: 'none' },
    },
    shape: { borderRadius: 12 },
    shadows: [
        'none',
        '0 1px 4px rgba(7,23,48,0.06)',
        '0 3px 10px rgba(7,23,48,0.08)',
        '0 6px 18px rgba(7,23,48,0.10)',
        '0 10px 28px rgba(7,23,48,0.12)',
        '0 14px 36px rgba(7,23,48,0.14)',
        '0 20px 48px rgba(7,23,48,0.16)',
        ...Array(18).fill('none'),
    ] as any,
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 18px rgba(14, 109, 205, 0.35)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #0a5db0 0%, #0e6dcd 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 28px rgba(14, 109, 205, 0.45)',
                    },
                    '&.Mui-disabled': {
                        background: 'linear-gradient(135deg, #0e6dcd 0%, #00b4ea 100%)',
                        color: 'rgba(255,255,255,0.5)',
                        opacity: 0.55,
                    },
                },
                outlinedPrimary: {
                    borderColor: '#c0d9f0',
                    color: '#0e6dcd',
                    '&:hover': {
                        borderColor: '#0e6dcd',
                        background: 'rgba(14,109,205,0.06)',
                        transform: 'translateY(-1px)',
                    },
                },
            },
        },
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    border: '1px solid #d8ecf8',
                    borderRadius: 16,
                    background: '#ffffff',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                        boxShadow: '0 8px 32px rgba(14,109,205,0.12)',
                        borderColor: '#a8d0f0',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        background: '#f8fbff',
                        '& fieldset': { borderColor: '#d0e6f7' },
                        '&:hover fieldset': { borderColor: '#00b4ea' },
                        '&.Mui-focused fieldset': { borderColor: '#0e6dcd', borderWidth: 2 },
                    },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#0e6dcd' },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 7, fontWeight: 600, fontSize: '0.78rem' },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: { borderRadius: 99, height: 8, background: '#e0f0fb' },
                bar: { borderRadius: 99, background: 'linear-gradient(90deg, #0e6dcd, #00b4ea)' },
            },
        },
        MuiAppBar: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    background: 'rgba(255,255,255,0.92)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    borderBottom: '1px solid #d8ecf8',
                    color: '#071730',
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 10, fontSize: '0.875rem' },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: { borderColor: '#d8ecf8' },
            },
        },
    },
});

export default theme;
export { OCEAN };
