import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import FutrixLogo from './FutrixLogo';
import { useAuth } from '../store/useAuth';

import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

// ─── Nav items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { path: '/dashboard',   label: 'Dashboard',    icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} /> },
    { path: '/upload',      label: 'Resume Upload', icon: <ArticleOutlinedIcon sx={{ fontSize: 20 }} /> },
    { path: '/result',      label: 'AI Analysis',  icon: <BarChartOutlinedIcon sx={{ fontSize: 20 }} /> },
    { path: '/skills-gap',  label: 'Skills Gap',   icon: <TrendingUpOutlinedIcon sx={{ fontSize: 20 }} /> },
    { path: '/career-path', label: 'Career Path',  icon: <TimelineOutlinedIcon sx={{ fontSize: 20 }} /> },
    { path: '/history',     label: 'History',      icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 20 }} /> },
    { path: '/profile',     label: 'Profile',      icon: <PersonOutlineIcon sx={{ fontSize: 20 }} /> },
];

// Bottom nav shows only the 5 most important routes on mobile
const BOTTOM_NAV_ITEMS = [
    { path: '/dashboard',   label: 'Home',    icon: <DashboardOutlinedIcon sx={{ fontSize: 22 }} /> },
    { path: '/upload',      label: 'Upload',  icon: <ArticleOutlinedIcon sx={{ fontSize: 22 }} /> },
    { path: '/result',      label: 'Result',  icon: <BarChartOutlinedIcon sx={{ fontSize: 22 }} /> },
    { path: '/skills-gap',  label: 'Gaps',    icon: <TrendingUpOutlinedIcon sx={{ fontSize: 22 }} /> },
    { path: '/profile',     label: 'Profile', icon: <PersonOutlineIcon sx={{ fontSize: 22 }} /> },
];

const SIDEBAR_W_EXPANDED = 230;
const SIDEBAR_W_COLLAPSED = 68;

// ─── Shared nav link ──────────────────────────────────────────────────────────
function NavLink({
    item,
    active,
    collapsed,
    onClick,
}: {
    item: typeof NAV_ITEMS[0];
    active: boolean;
    collapsed: boolean;
    onClick?: () => void;
}) {
    return (
        <Tooltip title={collapsed ? item.label : ''} placement="right" arrow>
            <Box
                component={Link}
                to={item.path}
                onClick={onClick}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: collapsed ? 1.5 : 2,
                    py: 1.1,
                    mx: 1,
                    my: 0.2,
                    borderRadius: '10px',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.18s',
                    background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                    '&:hover': {
                        background: active ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                    },
                }}
            >
                {active && (
                    <Box sx={{
                        position: 'absolute',
                        left: 0, top: '50%',
                        transform: 'translateY(-50%)',
                        width: 3, height: 20,
                        borderRadius: '0 3px 3px 0',
                        background: '#ffffff',
                    }} />
                )}
                <Box sx={{
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.18s',
                }}>
                    {React.cloneElement(item.icon, {
                        sx: {
                            fontSize: 19,
                            color: active ? '#ffffff' : 'rgba(255,255,255,0.38)',
                            transition: 'color 0.18s',
                        }
                    })}
                </Box>
                {!collapsed && (
                    <Typography sx={{
                        fontSize: '0.83rem',
                        fontWeight: active ? 600 : 500,
                        color: active ? '#ffffff' : 'rgba(255,255,255,0.45)',
                        transition: 'color 0.18s',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                    }}>
                        {item.label}
                    </Typography>
                )}
            </Box>
        </Tooltip>
    );
}

// ─── Sidebar content (shared between desktop sidebar & mobile drawer) ─────────
function SidebarContent({
    collapsed,
    setCollapsed,
    onClose,
    isDrawer = false,
}: {
    collapsed: boolean;
    setCollapsed?: (v: boolean) => void;
    onClose?: () => void;
    isDrawer?: boolean;
}) {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearAuth, email: authEmail, name: authName, avatar: authAvatar } = useAuth();
    const email  = authEmail  || localStorage.getItem('userEmail')  || '';
    const name   = authName   || localStorage.getItem('userName')   || '';
    const avatar = authAvatar || localStorage.getItem('userAvatar') || '';
    const initials = (name || email).slice(0, 2).toUpperCase();

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (token) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch { /* ignore */ }
        clearAuth();
        navigate('/login');
    };

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#0f0f0f',
            overflow: 'hidden',
        }}>
            {/* ── Brand ── */}
            <Box sx={{
                display: 'flex', alignItems: 'center',
                px: collapsed && !isDrawer ? 1.5 : 2.5, py: 2.5,
                gap: 1.5,
                borderBottom: '1px solid rgba(255,255,255,0.055)',
                minHeight: 68,
                justifyContent: 'space-between',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FutrixLogo size={34} />
                    {(!collapsed || isDrawer) && (
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', letterSpacing: '-0.035em', lineHeight: 1 }}>
                                Futrix
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.04em', mt: 0.2 }}>
                                AI Platform
                            </Typography>
                        </Box>
                    )}
                </Box>
                {isDrawer && (
                    <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff' } }}>
                        <CloseIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                )}
            </Box>

            {/* ── Nav ── */}
            <Box sx={{ flex: 1, py: 2, overflow: 'hidden auto' }}>
                {NAV_ITEMS.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <NavLink
                            key={item.path}
                            item={item}
                            active={active}
                            collapsed={collapsed && !isDrawer}
                            onClick={onClose}
                        />
                    );
                })}
            </Box>

            {/* ── Bottom: collapse toggle + user ── */}
            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.055)', p: 1.5 }}>
                {/* Collapse toggle (desktop only) */}
                {!isDrawer && setCollapsed && (
                    <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', mb: 1 }}>
                        <IconButton
                            onClick={() => setCollapsed(!collapsed)}
                            size="small"
                            sx={{
                                color: 'rgba(255,255,255,0.3)',
                                background: 'rgba(255,255,255,0.04)',
                                borderRadius: '8px',
                                width: 30, height: 30,
                                '&:hover': { background: 'rgba(255,255,255,0.08)', color: '#fff' },
                            }}
                        >
                            {collapsed ? <ChevronRightIcon sx={{ fontSize: 16 }} /> : <ChevronLeftIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                    </Box>
                )}

                {/* User row */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    p: (collapsed && !isDrawer) ? 0.5 : 1.2,
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    justifyContent: (collapsed && !isDrawer) ? 'center' : 'flex-start',
                }}>
                    <Avatar
                        src={avatar}
                        sx={{
                            width: 28, height: 28, fontSize: '0.72rem', fontWeight: 700,
                            background: 'rgba(255,255,255,0.12)',
                            color: '#ffffff',
                            flexShrink: 0,
                        }}
                    >
                        {initials}
                    </Avatar>
                    {(!collapsed || isDrawer) && (
                        <>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {name || email}
                                </Typography>
                                <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                                    Free plan
                                </Typography>
                            </Box>
                            <Tooltip title="Logout">
                                <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.25)', '&:hover': { color: '#f87171', background: 'rgba(248,113,113,0.08)' } }}>
                                    <LogoutOutlinedIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

// ─── Mobile top bar ───────────────────────────────────────────────────────────
function MobileTopBar({ onMenuOpen }: { onMenuOpen: () => void }) {
    const location = useLocation();
    const current = NAV_ITEMS.find(n => n.path === location.pathname);

    return (
        <Box sx={{
            position: 'fixed',
            top: 0, left: 0, right: 0,
            height: 56,
            background: 'rgba(15,15,15,0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            px: 2,
            gap: 1.5,
            zIndex: 1200,
        }}>
            <IconButton
                onClick={onMenuOpen}
                size="small"
                sx={{
                    color: 'rgba(255,255,255,0.6)',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '8px',
                    width: 36, height: 36,
                    '&:hover': { background: 'rgba(255,255,255,0.08)', color: '#fff' },
                }}
            >
                <MenuIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FutrixLogo size={26} />
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
                        Futrix AI
                    </Typography>
                    {current && (
                        <Typography sx={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1, mt: 0.2 }}>
                            {current.label}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

// ─── Mobile bottom nav ────────────────────────────────────────────────────────
function MobileBottomNav() {
    const location = useLocation();

    return (
        <Box sx={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            height: 64,
            background: 'rgba(12,12,12,0.97)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 1200,
            // iOS safe area
            paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
            {BOTTOM_NAV_ITEMS.map((item) => {
                const active = location.pathname === item.path;
                return (
                    <Box
                        key={item.path}
                        component={Link}
                        to={item.path}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 0.4,
                            flex: 1,
                            py: 1,
                            textDecoration: 'none',
                            position: 'relative',
                            transition: 'all 0.18s',
                        }}
                    >
                        {/* Active pill */}
                        {active && (
                            <Box sx={{
                                position: 'absolute',
                                top: 6,
                                width: 32, height: 32,
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.12)',
                            }} />
                        )}
                        <Box sx={{
                            color: active ? '#fff' : 'rgba(255,255,255,0.35)',
                            display: 'flex',
                            transition: 'color 0.18s',
                            zIndex: 1,
                        }}>
                            {React.cloneElement(item.icon, {
                                sx: {
                                    fontSize: 20,
                                    color: active ? '#fff' : 'rgba(255,255,255,0.35)',
                                }
                            })}
                        </Box>
                        <Typography sx={{
                            fontSize: '0.6rem',
                            fontWeight: active ? 700 : 400,
                            color: active ? '#fff' : 'rgba(255,255,255,0.28)',
                            letterSpacing: active ? '0.02em' : '0',
                            transition: 'all 0.18s',
                            lineHeight: 1,
                        }}>
                            {item.label}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const w = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

    if (isMobile) {
        return (
            <>
                <MobileTopBar onMenuOpen={() => setDrawerOpen(true)} />
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    PaperProps={{
                        sx: {
                            width: 260,
                            background: '#0f0f0f',
                            border: 'none',
                            borderRight: '1px solid rgba(255,255,255,0.055)',
                        }
                    }}
                >
                    <SidebarContent
                        collapsed={false}
                        isDrawer
                        onClose={() => setDrawerOpen(false)}
                    />
                </Drawer>
                <MobileBottomNav />
            </>
        );
    }

    return (
        <Box
            sx={{
                width: w,
                minWidth: w,
                maxWidth: w,
                height: '100vh',
                position: 'sticky',
                top: 0,
                borderRight: '1px solid rgba(255,255,255,0.055)',
                transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden',
                zIndex: 100,
                flexShrink: 0,
            }}
        >
            <SidebarContent
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />
        </Box>
    );
}
