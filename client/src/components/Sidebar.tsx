import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';

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

const SIDEBAR_W_EXPANDED = 230;
const SIDEBAR_W_COLLAPSED = 68;

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const email = localStorage.getItem('userEmail') || '';
    const initials = email.slice(0, 2).toUpperCase();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const w = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W_EXPANDED;

    return (
        <Box
            sx={{
                width: w,
                minWidth: w,
                maxWidth: w,
                height: '100vh',
                position: 'sticky',
                top: 0,
                background: '#0f0f0f',
                borderRight: '1px solid rgba(255,255,255,0.055)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.28s cubic-bezier(0.4,0,0.2,1), min-width 0.28s cubic-bezier(0.4,0,0.2,1)',
                overflow: 'hidden',
                zIndex: 100,
                flexShrink: 0,
            }}
        >
            {/* ── Brand ── */}
            <Box sx={{
                display: 'flex', alignItems: 'center',
                px: collapsed ? 1.5 : 2.5, py: 2.5,
                gap: 1.5,
                borderBottom: '1px solid rgba(255,255,255,0.055)',
                minHeight: 68,
            }}>
                {/* Logo mark */}
                <Box sx={{
                    width: 34, height: 34, borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #a3a3a3 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(255,255,255,0.12)',
                }}>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 900, color: '#0a0a0a', letterSpacing: '-0.04em', lineHeight: 1 }}>
                        CT
                    </Typography>
                </Box>
                {!collapsed && (
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', letterSpacing: '-0.035em', lineHeight: 1 }}>
                            CareerTwin
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', fontWeight: 500, letterSpacing: '0.04em', mt: 0.2 }}>
                            AI Platform
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ── Nav ── */}
            <Box sx={{ flex: 1, py: 2, overflow: 'hidden auto' }}>
                {NAV_ITEMS.map((item) => {
                    const active = location.pathname === item.path;
                    return (
                        <Tooltip
                            key={item.path}
                            title={collapsed ? item.label : ''}
                            placement="right"
                            arrow
                        >
                            <Box
                                component={Link}
                                to={item.path}
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
                                {/* Active indicator */}
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
                                    '.sidebar-box:hover &': { color: active ? '#ffffff' : 'rgba(255,255,255,0.7)' },
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
                })}
            </Box>

            {/* ── Bottom: collapse toggle + user ── */}
            <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.055)', p: 1.5 }}>
                {/* Collapse toggle */}
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

                {/* User row */}
                <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    p: collapsed ? 0.5 : 1.2,
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                }}>
                    <Avatar sx={{
                        width: 28, height: 28, fontSize: '0.72rem', fontWeight: 700,
                        background: 'rgba(255,255,255,0.12)',
                        color: '#ffffff',
                        flexShrink: 0,
                    }}>
                        {initials}
                    </Avatar>
                    {!collapsed && (
                        <>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {email}
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
