import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface SkillRadarProps {
    skills: string[];
    gapSkills: string[];
}

// Build dummy proficiency for existing skills (detected = high) vs gaps (low)
// Deterministic hash so values don't re-randomize on every render
function hashNum(s: string, min: number, range: number): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffff;
    return min + (h % range);
}

function buildData(skills: string[], gaps: string[]) {
    const items: { subject: string; value: number; fullMark: number }[] = [];
    const show = [...skills.slice(0, 6), ...gaps.slice(0, 3)];
    show.forEach((s) => {
        items.push({
            subject: s.length > 10 ? s.slice(0, 10) + '..' : s,
            value: skills.includes(s) ? hashNum(s, 65, 35) : hashNum(s, 10, 30),
            fullMark: 100,
        });
    });
    return items;
}

export default function SkillRadar({ skills, gapSkills }: SkillRadarProps) {
    const data = buildData(skills, gapSkills);

    return (
        <Box sx={{ 
            width: '100%', 
            minWidth: 160, // Prevent negative width on very small screens
            maxWidth: '100%',
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: 240,
            '& .recharts-wrapper': {
                width: '100% !important',
                maxWidth: '100%',
                overflow: 'hidden',
            }
        }}>
            <ResponsiveContainer width="100%" height={240} minWidth={160}>
                <RadarChart data={data} outerRadius="38%">
                    <PolarGrid stroke="rgba(255,255,255,0.06)" gridType="polygon" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
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
                        formatter={((v: unknown) => [`${Number(v) || 0}%`, 'Proficiency']) as never}
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
            <Typography sx={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', mt: 0.5 }}>
                Skill Proficiency Radar
            </Typography>
        </Box>
    );
}
