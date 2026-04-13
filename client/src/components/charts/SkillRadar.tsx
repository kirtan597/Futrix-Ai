import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface SkillRadarProps {
    skills: string[];
    gapSkills: string[];
}

// Build dummy proficiency for existing skills (detected = high) vs gaps (low)
function buildData(skills: string[], gaps: string[]) {
    const items: { subject: string; value: number; fullMark: number }[] = [];
    const show = [...skills.slice(0, 6), ...gaps.slice(0, 3)];
    show.forEach((s) => {
        items.push({
            subject: s.length > 10 ? s.slice(0, 10) + '..' : s,
            value: skills.includes(s) ? Math.floor(65 + Math.random() * 35) : Math.floor(10 + Math.random() * 30),
            fullMark: 100,
        });
    });
    return items;
}

export default function SkillRadar({ skills, gapSkills }: SkillRadarProps) {
    const data = buildData(skills, gapSkills);

    return (
        <Box sx={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%" style={{ background: 'transparent' }}>
                <RadarChart data={data} outerRadius={90}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" gridType="polygon" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    />
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
                        formatter={(v: number) => [`${v}%`, 'Proficiency']}
                    />
                    <Radar
                        dataKey="value"
                        stroke="rgba(255,255,255,0.6)"
                        fill="rgba(255,255,255,0.08)"
                        strokeWidth={1.5}
                        dot={{ fill: '#ffffff', r: 3, strokeWidth: 0 }}
                        activeDot={{ fill: '#ffffff', r: 5 }}
                    />
                </RadarChart>
            </ResponsiveContainer>
            <Typography sx={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mt: -1 }}>
                Skill Proficiency Radar
            </Typography>
        </Box>
    );
}
