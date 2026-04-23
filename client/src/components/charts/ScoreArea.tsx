import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Box from '@mui/material/Box';

// Simulated historical score data (last 6 analyses)
const MOCK_DATA = [
    { label: 'Jan', score: 42 },
    { label: 'Feb', score: 51 },
    { label: 'Mar', score: 58 },
    { label: 'Apr', score: 63 },
    { label: 'May', score: 72 },
    { label: 'Now', score: 0 }, // will be overridden
];

interface ScoreAreaProps {
    currentScore: number;
}

export default function ScoreArea({ currentScore }: ScoreAreaProps) {
    const data = [
        ...MOCK_DATA.slice(0, 5),
        { label: 'Now', score: currentScore },
    ];

    return (
        <Box sx={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%" style={{ background: 'transparent' }}>
                <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="rgba(255,255,255,0.18)" stopOpacity={1} />
                            <stop offset="95%" stopColor="rgba(255,255,255,0)"    stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        wrapperStyle={{ outline: 'none' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                        contentStyle={{
                            background: '#1a1a1a',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 10,
                            color: '#fff',
                            fontSize: 12,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        }}
                        formatter={((v: unknown) => [`${Number(v) || 0}%`, 'Score']) as never}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="rgba(255,255,255,0.7)"
                        strokeWidth={2}
                        fill="url(#scoreGrad)"
                        dot={{ fill: '#ffffff', strokeWidth: 0, r: 3 }}
                        activeDot={{ fill: '#ffffff', r: 5, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
}
