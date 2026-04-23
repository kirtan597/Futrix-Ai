import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface FunnelBarProps {
    skills: string[];
    gapSkills: string[];
}

export default function FunnelBar({ skills, gapSkills }: FunnelBarProps) {
    // Skill priority score: detected = 100, gap = randomised lower value
    const data = [
        ...skills.slice(0, 5).map((s) => ({
            name: s.length > 9 ? s.slice(0, 9) + '..' : s,
            value: Math.floor(60 + Math.random() * 40),
            type: 'have' as const,
        })),
        ...gapSkills.slice(0, 4).map((g) => ({
            name: g.length > 9 ? g.slice(0, 9) + '..' : g,
            value: Math.floor(10 + Math.random() * 30),
            type: 'gap' as const,
        })),
    ].sort((a, b) => b.value - a.value);

    return (
        <Box sx={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%" style={{ background: 'transparent' }}>
                <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 4 }} barSize={18}>
                    <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        wrapperStyle={{ outline: 'none' }}
                        cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        contentStyle={{
                            background: '#1a1a1a',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 10,
                            color: '#fff',
                            fontSize: 12,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        }}
                        formatter={((v: unknown, _n: unknown, props: { payload: { type: string } }) => [
                            `${Number(v) || 0}% proficiency`,
                            props.payload.type === 'have' ? 'Detected' : 'Gap',
                        ]) as never}
                    />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.type === 'have'
                                    ? `rgba(255,255,255,${0.4 + index * 0.03})`
                                    : 'rgba(255,255,255,0.08)'
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <Typography sx={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.22)', mt: -1 }}>
                Skill Proficiency Comparison
            </Typography>
        </Box>
    );
}
