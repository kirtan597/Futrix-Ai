import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface GapDonutProps {
    skillsCount: number;
    gapCount: number;
}

export default function GapDonut({ skillsCount, gapCount }: GapDonutProps) {
    const data = [
        { name: 'Detected Skills', value: skillsCount },
        { name: 'Skill Gaps',      value: gapCount },
    ];
    const COLORS = ['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.2)'];

    return (
        <Box sx={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%" style={{ background: 'transparent' }}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        wrapperStyle={{ outline: 'none' }}
                        contentStyle={{
                            background: '#1a1a1a',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 10,
                            color: '#fff',
                            fontSize: 12,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                        }}
                    />
                    <Legend
                        iconType="circle"
                        iconSize={7}
                        formatter={(value) => (
                            <Typography component="span" sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                                {value}
                            </Typography>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    );
}
