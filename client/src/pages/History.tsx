import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import apiService from '../services/apiService';
import { useAuth } from '../store/useAuth';

interface HistoryEntry {
    id: string;
    rawId?: string;
    date: string;
    skills: string[];
    gap_skills: string[];
    readiness_score: number;
    roadmap_steps: number;
    roadmap?: string[];
    score_breakdown?: any;
    career_paths?: any[];
    isDemo?: boolean;
}

interface HistoryResponseItem {
    _id?: string;
    id?: string;
    createdAt?: string;
    created_at?: string;
    skills?: string[];
    gap_skills?: string[];
    readiness_score?: number;
    roadmap?: string[];
    score_breakdown?: any;
    career_paths?: any[];
}

function Sep() {
    return <Box sx={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.06)', my: 2, flexShrink: 0 }} />;
}

function GlassCard({ children, sx = {}, onClick }: { children: React.ReactNode; sx?: object; onClick?: () => void }) {
    return (
        <Box 
            onClick={onClick}
            sx={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '18px',
                backdropFilter: 'blur(20px)',
                transition: 'all 0.25s ease',
                ...sx,
            }}
        >
            {children}
        </Box>
    );
}

function MiniRing({ score, size = 52 }: { score: number; size?: number }) {
    const sw = 4.5;
    const r = (size / 2) - sw - 2;
    const circ = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(100, Math.round(score || 0)));
    const offset = circ - (clamped / 100) * circ;

    return (
        <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block', overflow: 'visible' }}>
                <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={sw} />
                <circle
                    cx={size/2}
                    cy={size/2}
                    r={r}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={sw}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
            </svg>
            <Box sx={{ position: 'absolute', textAlign: 'center', pointerEvents: 'none' }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {clamped}
                </Typography>
            </Box>
        </Box>
    );
}

// ─── Pure SVG High-Reliability Progression Curve ─────────────────────────────
function PureSVGHistoryChart({ data }: { data: { label: string; score: number; date: string }[] }) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const chartPoints = data.length > 0 ? data : [
        { label: 'Baseline', score: 55, date: 'Baseline' },
        { label: 'Evaluation', score: 78, date: 'Recent' },
    ];

    const W = 600;
    const H = 210;
    const PAD_L = 40;
    const PAD_R = 30;
    const PAD_T = 24;
    const PAD_B = 35;

    const plotW = W - PAD_L - PAD_R;
    const plotH = H - PAD_T - PAD_B;

    const points = chartPoints.map((d, i) => {
        const x = PAD_L + (chartPoints.length > 1 ? (i / (chartPoints.length - 1)) * plotW : plotW / 2);
        const y = PAD_T + (1 - Math.max(0, Math.min(100, d.score)) / 100) * plotH;
        return { ...d, x, y };
    });

    const pathD = points.reduce((acc, p, i, arr) => {
        if (i === 0) return `M ${p.x},${p.y}`;
        const prev = arr[i - 1];
        const cx1 = prev.x + (p.x - prev.x) / 2;
        const cy1 = prev.y;
        const cx2 = prev.x + (p.x - prev.x) / 2;
        const cy2 = p.y;
        return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${p.x},${p.y}`;
    }, '');

    const areaD = points.length > 1
        ? `${pathD} L ${points[points.length - 1].x},${H - PAD_B} L ${points[0].x},${H - PAD_B} Z`
        : '';

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * W;

        let closestIdx = 0;
        let minDist = Infinity;
        points.forEach((p, idx) => {
            const dist = Math.abs(p.x - mouseX);
            if (dist < minDist) {
                minDist = dist;
                closestIdx = idx;
            }
        });
        setHoveredIdx(closestIdx);
    };

    const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

    return (
        <Box sx={{ width: '100%', height: 210, position: 'relative' }}>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                style={{ width: '100%', height: '100%', overflow: 'visible', cursor: 'crosshair' }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredIdx(null)}
            >
                <defs>
                    <linearGradient id="historyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255, 255, 255, 0.22)" />
                        <stop offset="60%" stopColor="rgba(255, 255, 255, 0.05)" />
                        <stop offset="100%" stopColor="rgba(255, 255, 255, 0.0)" />
                    </linearGradient>
                    <filter id="historyDotGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Horizontal Grid lines */}
                {[0, 25, 50, 75, 100].map((level) => {
                    const y = PAD_T + (1 - level / 100) * plotH;
                    return (
                        <g key={level}>
                            <line
                                x1={PAD_L}
                                y1={y}
                                x2={W - PAD_R}
                                y2={y}
                                stroke="rgba(255, 255, 255, 0.05)"
                                strokeDasharray={level === 70 ? 'none' : '3 3'}
                            />
                            <text
                                x={PAD_L - 8}
                                y={y + 3.5}
                                textAnchor="end"
                                fill="rgba(255, 255, 255, 0.3)"
                                fontSize="9"
                                fontWeight="600"
                            >
                                {level}
                            </text>
                        </g>
                    );
                })}

                {/* Target Baseline 70% Marker */}
                <line
                    x1={PAD_L}
                    y1={PAD_T + (1 - 70 / 100) * plotH}
                    x2={W - PAD_R}
                    y2={PAD_T + (1 - 70 / 100) * plotH}
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeDasharray="4 4"
                />

                {/* Filled Area Gradient */}
                {areaD && (
                    <path
                        d={areaD}
                        fill="url(#historyAreaGrad)"
                        style={{ transition: 'all 0.3s ease' }}
                    />
                )}

                {/* Main Trajectory Stroke */}
                <path
                    d={pathD}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.85)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: 'all 0.3s ease' }}
                />

                {/* Active Hover Crosshair Line */}
                {activePoint && (
                    <line
                        x1={activePoint.x}
                        y1={PAD_T}
                        x2={activePoint.x}
                        y2={H - PAD_B}
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                    />
                )}

                {/* Milestone Pulse Dots */}
                {points.map((p, idx) => {
                    const isHovered = hoveredIdx === idx;
                    return (
                        <g key={idx}>
                            {isHovered && (
                                <circle
                                    cx={p.x}
                                    cy={p.y}
                                    r="10"
                                    fill="rgba(255, 255, 255, 0.15)"
                                />
                            )}
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r={isHovered ? '5' : '3.5'}
                                fill="#ffffff"
                                stroke="#0a0a0a"
                                strokeWidth="2"
                                filter={isHovered ? 'url(#historyDotGlow)' : undefined}
                                style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                            />
                            {/* X-axis date labels */}
                            <text
                                x={p.x}
                                y={H - PAD_B + 16}
                                textAnchor="middle"
                                fill={isHovered ? '#ffffff' : 'rgba(255, 255, 255, 0.4)'}
                                fontSize="9.5"
                                fontWeight={isHovered ? '800' : '600'}
                            >
                                {p.label}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Floating Inspection Tooltip */}
            {activePoint && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 10,
                        right: 15,
                        background: 'rgba(20, 20, 20, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        borderRadius: '10px',
                        px: 1.5,
                        py: 0.8,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.2,
                    }}
                >
                    <Box>
                        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                            {activePoint.date}
                        </Typography>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>
                            Score: {activePoint.score}/100
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

// ─── Default Sample Demonstrations (guarantees zero empty state) ──────────────
const DEMO_HISTORY_ENTRIES: HistoryEntry[] = [
    {
        id: 'demo-1',
        rawId: 'demo-1',
        date: '2026-08-30',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'FastAPI'],
        gap_skills: ['Kubernetes', 'CI/CD'],
        readiness_score: 84,
        roadmap_steps: 4,
        roadmap: ['Master Kubernetes Cluster Orchestration', 'Automate GitHub Actions CI/CD Pipeline', 'Implement Redis Cache Layer', 'Complete System Design Interview Prep'],
        isDemo: true,
    },
    {
        id: 'demo-2',
        rawId: 'demo-2',
        date: '2026-07-15',
        skills: ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
        gap_skills: ['TypeScript', 'Docker', 'AWS', 'Kubernetes'],
        readiness_score: 68,
        roadmap_steps: 5,
        roadmap: ['Learn TypeScript Strict Typing', 'Containerize with Docker', 'Deploy to AWS EC2', 'Add Unit Tests with Jest', 'Refactor Backend Architecture'],
        isDemo: true,
    },
    {
        id: 'demo-3',
        rawId: 'demo-3',
        date: '2026-05-10',
        skills: ['JavaScript', 'HTML5', 'CSS3', 'React'],
        gap_skills: ['Node.js', 'TypeScript', 'SQL', 'Docker', 'AWS'],
        readiness_score: 52,
        roadmap_steps: 6,
        roadmap: ['Full Stack Backend Foundations', 'Master RESTful API Design', 'Relational Database Modeling', 'Authentication & JWT Sessions'],
        isDemo: true,
    },
];

export default function History() {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [sortBy, setSortBy] = useState<'recent' | 'highest'>('recent');
    const [selectedCompare, setSelectedCompare] = useState<string[]>([]);
    const { email } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistoryData = async () => {
            try {
                const res = await apiService.get<any>('/api/history');
                const rawArray: HistoryResponseItem[] = Array.isArray(res) 
                    ? res 
                    : (res && Array.isArray(res.data) ? res.data : []);

                if (rawArray.length > 0) {
                    const mapped: HistoryEntry[] = rawArray.map((h) => {
                        const idStr = String(h._id || h.id || `hist-${Math.random()}`);
                        const rawDate = h.createdAt || h.created_at || new Date().toISOString();
                        const formattedDate = rawDate.split('T')[0];

                        return {
                            id: idStr,
                            rawId: idStr,
                            date: formattedDate,
                            skills: Array.isArray(h.skills) ? h.skills : [],
                            gap_skills: Array.isArray(h.gap_skills) ? h.gap_skills : [],
                            readiness_score: typeof h.readiness_score === 'number' ? h.readiness_score : 0,
                            roadmap_steps: Array.isArray(h.roadmap) ? h.roadmap.length : 0,
                            roadmap: h.roadmap,
                            score_breakdown: h.score_breakdown,
                            career_paths: h.career_paths,
                            isDemo: false,
                        };
                    });
                    setHistory(mapped);
                } else {
                    // Check local storage active analysis fallback
                    const stored = localStorage.getItem('analysisResult') || localStorage.getItem('last_analysis');
                    if (stored) {
                        try {
                            const d = JSON.parse(stored);
                            setHistory([{
                                id: d._id || d.id || 'active-current',
                                rawId: d._id || d.id || 'active-current',
                                date: new Date().toISOString().split('T')[0],
                                skills: d.skills || [],
                                gap_skills: d.gap_skills || [],
                                readiness_score: d.readiness_score || 0,
                                roadmap_steps: d.roadmap?.length || 0,
                                roadmap: d.roadmap,
                                score_breakdown: d.score_breakdown,
                                career_paths: d.career_paths,
                                isDemo: false,
                            }, ...DEMO_HISTORY_ENTRIES.slice(0, 2)]);
                        } catch {
                            setHistory(DEMO_HISTORY_ENTRIES);
                        }
                    } else {
                        setHistory(DEMO_HISTORY_ENTRIES);
                    }
                }
            } catch (err) {
                console.warn('[History] Falling back to structured progression demo:', err);
                setHistory(DEMO_HISTORY_ENTRIES);
            } finally {
                setLoading(false);
                setMounted(true);
            }
        };

        fetchHistoryData();
    }, [email]);

    const handleSelectAnalysis = (entry: HistoryEntry) => {
        const analysisData = {
            _id: entry.rawId || entry.id,
            id: entry.rawId || entry.id,
            skills: entry.skills,
            gap_skills: entry.gap_skills,
            readiness_score: entry.readiness_score,
            roadmap: entry.roadmap || [],
            score_breakdown: entry.score_breakdown,
            career_paths: entry.career_paths || [],
        };
        localStorage.setItem('analysisResult', JSON.stringify(analysisData));
        localStorage.setItem('last_analysis', JSON.stringify(analysisData));
        navigate('/result');
    };

    const toggleCompareSelect = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedCompare(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            if (prev.length >= 2) return [prev[1], id];
            return [...prev, id];
        });
    };

    const handleRunComparison = () => {
        if (selectedCompare.length === 2) {
            navigate(`/compare?id1=${selectedCompare[0]}&id2=${selectedCompare[1]}`);
        }
    };

    const sortedHistory = [...history].sort((a, b) => {
        if (sortBy === 'highest') return b.readiness_score - a.readiness_score;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const chartTimelineData = [...history].reverse().map((h, i) => ({
        label: i === history.length - 1 ? 'Latest' : (h.date.slice(5) || `Entry ${i + 1}`),
        score: h.readiness_score,
        date: h.date,
    }));

    const bestScore = history.length > 0 ? Math.max(...history.map(h => h.readiness_score)) : 0;
    const latestScore = history.length > 0 ? history[0].readiness_score : 0;
    const oldestScore = history.length > 0 ? history[history.length - 1].readiness_score : 0;
    const totalGrowth = history.length > 1 ? latestScore - oldestScore : 0;

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
                <CircularProgress size={32} sx={{ color: 'rgba(255,255,255,0.7)' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', background: '#0a0a0a', py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3, md: 5 } }}>
            {/* ── Top Header ── */}
            <Box sx={{ maxWidth: 1200, mx: 'auto', mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, opacity: mounted ? 1 : 0, transition: 'opacity 0.4s' }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.8 }}>
                        <Chip
                            icon={<AutoAwesomeIcon sx={{ fontSize: '13px !important', color: '#ffffff' }} />}
                            label="Historical Analytics"
                            size="small"
                            sx={{ background: 'rgba(255,255,255,0.06)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)', fontWeight: 700, fontSize: '0.72rem' }}
                        />
                        <Chip
                            icon={<AssessmentOutlinedIcon sx={{ fontSize: '13px !important', color: 'rgba(255,255,255,0.6)' }} />}
                            label={`${history.length} Analysis Runs Logged`}
                            size="small"
                            sx={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, fontSize: '0.72rem' }}
                        />
                    </Box>
                    <Typography variant="h4" fontWeight={900} sx={{ color: '#fff', letterSpacing: '-0.04em', mb: 0.8, fontSize: { xs: '1.6rem', md: '2.2rem' } }}>
                        Analysis History & Progression
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                        Track skill readiness index improvements, compare evaluations, and inspect past career roadmaps.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    {selectedCompare.length === 2 && (
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<CompareArrowsIcon sx={{ fontSize: 16 }} />}
                            onClick={handleRunComparison}
                            sx={{
                                background: '#ffffff',
                                color: '#0a0a0a',
                                fontWeight: 800,
                                borderRadius: '10px',
                                textTransform: 'none',
                                px: 2,
                                py: 0.8,
                                '&:hover': { background: '#e5e5e5' }
                            }}
                        >
                            Compare Selected (2)
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<UploadFileOutlinedIcon sx={{ fontSize: 16 }} />}
                        onClick={() => navigate('/upload')}
                        sx={{
                            borderColor: 'rgba(255,255,255,0.18)',
                            color: '#ffffff',
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2,
                            py: 0.8,
                            '&:hover': { borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)' }
                        }}
                    >
                        New Resume Analysis
                    </Button>
                </Box>
            </Box>

            <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
                {/* ── Top Metric Highlights Strip ── */}
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
                    {[
                        { label: 'Analyses Logged', value: history.length, suffix: 'reports' },
                        { label: 'Highest Readiness', value: bestScore, suffix: '/ 100' },
                        { label: 'Latest Score', value: latestScore, suffix: '/ 100' },
                        { label: 'Total Career Growth', value: `${totalGrowth >= 0 ? '+' : ''}${totalGrowth}`, suffix: 'pts gain' },
                    ].map(({ label, value, suffix }) => (
                        <GlassCard key={label} sx={{ p: { xs: 2, md: 2.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 0.4 }}>
                                <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.05em', lineHeight: 1 }}>
                                    {value}
                                </Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                                    {suffix}
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>
                                {label}
                            </Typography>
                        </GlassCard>
                    ))}
                </Box>

                {/* ── Score Progression Visual Curve ── */}
                <GlassCard sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUpOutlinedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }} />
                            <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
                                Readiness Score Trajectory Over Time
                            </Typography>
                        </Box>
                        <Chip
                            label={totalGrowth >= 0 ? `+${totalGrowth} pts Growth` : `${totalGrowth} pts Shift`}
                            size="small"
                            sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                background: 'rgba(255,255,255,0.08)',
                                color: '#ffffff',
                                border: '1px solid rgba(255,255,255,0.18)',
                            }}
                        />
                    </Box>
                    <Typography sx={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', mb: 2.5 }}>
                        Monotone progression mapping score gains across your historical evaluations.
                    </Typography>

                    <PureSVGHistoryChart data={chartTimelineData} />
                </GlassCard>

                {/* ── Timeline List Filter & Header ── */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                        Past Analysis Reports ({sortedHistory.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                            label="Newest First"
                            size="small"
                            onClick={() => setSortBy('recent')}
                            sx={{
                                cursor: 'pointer',
                                background: sortBy === 'recent' ? '#fff' : 'rgba(255,255,255,0.04)',
                                color: sortBy === 'recent' ? '#000' : 'rgba(255,255,255,0.6)',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                            }}
                        />
                        <Chip
                            label="Highest Score"
                            size="small"
                            onClick={() => setSortBy('highest')}
                            sx={{
                                cursor: 'pointer',
                                background: sortBy === 'highest' ? '#fff' : 'rgba(255,255,255,0.04)',
                                color: sortBy === 'highest' ? '#000' : 'rgba(255,255,255,0.6)',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                            }}
                        />
                    </Box>
                </Box>

                {/* ── Timeline Card Items ── */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {sortedHistory.map((h, i) => {
                        const isLatest = i === 0 && sortBy === 'recent';
                        const prev = sortedHistory[i + 1];
                        const delta = prev ? h.readiness_score - prev.readiness_score : null;
                        const isCompareSelected = selectedCompare.includes(h.id);

                        return (
                            <Box key={h.id} sx={{ display: 'flex', gap: { xs: 1.5, md: 2.5 } }}>
                                {/* Mini Ring Gauge */}
                                <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', alignItems: 'center', pt: 1 }}>
                                    <MiniRing score={h.readiness_score} size={isLatest ? 56 : 50} />
                                </Box>

                                {/* Main Evaluation Card */}
                                <GlassCard
                                    onClick={() => handleSelectAnalysis(h)}
                                    sx={{
                                        flex: 1,
                                        p: { xs: 2.5, md: 3 },
                                        borderColor: isCompareSelected ? 'rgba(255,255,255,0.5)' : (isLatest ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'),
                                        cursor: 'pointer',
                                        position: 'relative',
                                        '&:hover': {
                                            borderColor: 'rgba(255,255,255,0.3)',
                                            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
                                            transform: 'translateY(-2px)',
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.4 }}>
                                                <AccessTimeOutlinedIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }} />
                                                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                                                    {h.date}
                                                </Typography>
                                                {isLatest && (
                                                    <Chip label="Latest Evaluation" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, background: '#ffffff', color: '#000000' }} />
                                                )}
                                                {h.isDemo && (
                                                    <Chip label="Sample Baseline" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }} />
                                                )}
                                            </Box>
                                            <Typography sx={{ fontSize: '0.96rem', fontWeight: 800, color: '#ffffff' }}>
                                                Analysis #{sortedHistory.length - i} — {h.skills.slice(0, 2).join(' / ')} Stack
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                                                <MiniRing score={h.readiness_score} size={46} />
                                            </Box>
                                            {delta !== null && (
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, justifyContent: 'flex-end' }}>
                                                        {delta >= 0
                                                            ? <TrendingUpOutlinedIcon sx={{ fontSize: 13, color: '#ffffff' }} />
                                                            : <TrendingDownOutlinedIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }} />
                                                        }
                                                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#ffffff' }}>
                                                            {delta > 0 ? '+' : ''}{delta} pts
                                                        </Typography>
                                                    </Box>
                                                    <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>vs previous</Typography>
                                                </Box>
                                            )}

                                            <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={(e) => toggleCompareSelect(e, h.id)}
                                                sx={{
                                                    borderRadius: '8px',
                                                    borderColor: isCompareSelected ? '#ffffff' : 'rgba(255,255,255,0.12)',
                                                    background: isCompareSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                    color: isCompareSelected ? '#ffffff' : 'rgba(255,255,255,0.6)',
                                                    fontSize: '0.7rem',
                                                    textTransform: 'none',
                                                    fontWeight: 700,
                                                    py: 0.4,
                                                    px: 1.2,
                                                }}
                                            >
                                                {isCompareSelected ? '✓ Selected' : '+ Compare'}
                                            </Button>

                                            <Button
                                                size="small"
                                                variant="text"
                                                endIcon={<VisibilityOutlinedIcon sx={{ fontSize: '14px !important' }} />}
                                                sx={{ color: '#ffffff', fontSize: '0.75rem', textTransform: 'none', fontWeight: 700 }}
                                            >
                                                View Report
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Sep />

                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 0.8fr' }, gap: 2 }}>
                                        {/* Detected Skills */}
                                        <Box>
                                            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                                                Detected Skills ({h.skills.length})
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                                                {h.skills.slice(0, 5).map(s => (
                                                    <Chip key={s} label={s} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.12)' }} />
                                                ))}
                                                {h.skills.length > 5 && (
                                                    <Chip label={`+${h.skills.length - 5} more`} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600, background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(255,255,255,0.12)' }} />
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Skill Gaps */}
                                        <Box>
                                            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                                                Priority Skill Gaps ({h.gap_skills.length})
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                                                {h.gap_skills.length > 0 ? (
                                                    h.gap_skills.slice(0, 4).map(g => (
                                                        <Chip key={g} label={`+ ${g}`} size="small" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600, background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }} />
                                                    ))
                                                ) : (
                                                    <Typography sx={{ fontSize: '0.74rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                                                        ✓ Zero critical gaps remaining
                                                    </Typography>
                                                )}
                                                {h.gap_skills.length > 4 && (
                                                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', alignSelf: 'center' }}>+{h.gap_skills.length - 4}</Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Roadmap Milestones */}
                                        <Box>
                                            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', mb: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                                                Roadmap Milestones
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                                                {h.roadmap_steps} Active Milestones
                                            </Typography>
                                        </Box>
                                    </Box>
                                </GlassCard>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}
