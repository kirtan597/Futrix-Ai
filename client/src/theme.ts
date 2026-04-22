import { createTheme } from '@mui/material/styles';

// ─── Futrix AI — Monochrome SaaS Design System ───────────────────────────
// Sophisticated black, white & gray palette. Premium, minimal, data-forward.

export const MONO = {
    black:      '#0a0a0a',   // near-pure black (hero backgrounds)
    ink:        '#111111',   // deep ink (primary dark)
    charcoal:   '#1a1a1a',   // charcoal (surface dark)
    slate:      '#242424',   // slate (cards dark)
    iron:       '#2e2e2e',   // iron (borders dark)
    graphite:   '#3a3a3a',   // graphite (secondary dark)
    dim:        '#525252',   // dim gray (muted text)
    mid:        '#737373',   // mid gray (subtext)
    silver:     '#a3a3a3',   // silver (placeholder)
    mist:       '#d4d4d4',   // mist (light borders)
    fog:        '#e5e5e5',   // fog (dividers)
    smoke:      '#f0f0f0',   // smoke (light surface)
    ash:        '#f5f5f5',   // ash (background light)
    white:      '#ffffff',   // pure white
    // Accent: pure white glow on dark
    accent:     '#ffffff',
    accentDim:  'rgba(255,255,255,0.7)',
    accentFaint: 'rgba(255,255,255,0.08)',
};

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main:         '#ffffff',
            light:        '#f5f5f5',
            dark:         '#d4d4d4',
            contrastText: '#0a0a0a',
        },
        secondary: {
            main:         '#a3a3a3',
            light:        '#d4d4d4',
            dark:         '#525252',
            contrastText: '#ffffff',
        },
        background: {
            default: '#0a0a0a',
            paper:   '#111111',
        },
        text: {
            primary:   '#ffffff',
            secondary: '#a3a3a3',
        },
        divider:  'rgba(255,255,255,0.08)',
        success:  { main: '#4ade80', dark: '#16a34a', contrastText: '#000' },
        warning:  { main: '#fbbf24', dark: '#d97706', contrastText: '#000' },
        error:    { main: '#f87171', dark: '#dc2626', contrastText: '#000' },
        info:     { main: '#94a3b8', contrastText: '#000' },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica Neue", Arial, sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.04em' },
        h2: { fontWeight: 700, letterSpacing: '-0.03em' },
        h3: { fontWeight: 700, letterSpacing: '-0.025em' },
        h4: { fontWeight: 700, letterSpacing: '-0.02em' },
        h5: { fontWeight: 600, letterSpacing: '-0.01em' },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 500, letterSpacing: '-0.005em' },
        button: {
            fontWeight: 600,
            letterSpacing: '0.01em',
            textTransform: 'none',
        },
    },
    shape: { borderRadius: 12 },
    shadows: [
        'none',
        '0 1px 4px rgba(0,0,0,0.4)',
        '0 3px 10px rgba(0,0,0,0.5)',
        '0 6px 18px rgba(0,0,0,0.55)',
        '0 10px 28px rgba(0,0,0,0.6)',
        '0 14px 36px rgba(0,0,0,0.65)',
        '0 20px 48px rgba(0,0,0,0.7)',
        ...Array(18).fill('none'),
    ] as any,
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: '#0a0a0a',
                    color: '#ffffff',
                },
                '*::-webkit-scrollbar': { width: '5px', height: '5px' },
                '*::-webkit-scrollbar-track': { background: 'transparent' },
                '*::-webkit-scrollbar-thumb': {
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: '99px',
                },
                '*::-webkit-scrollbar-thumb:hover': {
                    background: 'rgba(255,255,255,0.22)',
                },
            },
        },
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 22px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                containedPrimary: {
                    background: '#ffffff',
                    color: '#0a0a0a',
                    '&:hover': {
                        background: '#e5e5e5',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 8px 28px rgba(255,255,255,0.12)',
                    },
                    '&.Mui-disabled': {
                        background: 'rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.28)',
                    },
                },
                outlinedPrimary: {
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                        borderColor: 'rgba(255,255,255,0.5)',
                        background: 'rgba(255,255,255,0.05)',
                        transform: 'translateY(-1px)',
                    },
                },
                textPrimary: {
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                        background: 'rgba(255,255,255,0.05)',
                        color: '#ffffff',
                    },
                },
            },
        },
        MuiCard: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    background: '#111111',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 16,
                    transition: 'all 0.25s ease',
                    '&:hover': {
                        borderColor: 'rgba(255,255,255,0.14)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.03)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.25)' },
                        '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.5)', borderWidth: 1.5 },
                        '& input, & textarea': { color: '#ffffff' },
                    },
                    '& .MuiInputLabel-root': { color: '#737373' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 7,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 99,
                    height: 6,
                    background: 'rgba(255,255,255,0.08)',
                },
                bar: {
                    borderRadius: 99,
                    background: 'linear-gradient(90deg, #ffffff, #a3a3a3)',
                },
            },
        },
        MuiAppBar: {
            defaultProps: { elevation: 0 },
            styleOverrides: {
                root: {
                    background: 'rgba(10,10,10,0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 10, fontSize: '0.875rem' },
                standardError: {
                    background: 'rgba(248,113,113,0.08)',
                    border: '1px solid rgba(248,113,113,0.2)',
                    color: '#fca5a5',
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: { borderColor: 'rgba(255,255,255,0.06)' },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '0.78rem',
                    borderRadius: 8,
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    background: '#1a1a1a',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    margin: '2px 6px',
                    '&:hover': { background: 'rgba(255,255,255,0.06)' },
                    '&.Mui-selected': {
                        background: 'rgba(255,255,255,0.08)',
                        '&:hover': { background: 'rgba(255,255,255,0.1)' },
                    },
                },
            },
        },
    },
});

export default theme;
