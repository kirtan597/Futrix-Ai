import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

interface SkillHeatmapProps {
    skills: string[];
    gapSkills: string[];
}

/** Deterministic proficiency level based on skill name hash */
function profLevel(skill: string): number {
    let h = 0;
    for (let i = 0; i < skill.length; i++) h = (h * 31 + skill.charCodeAt(i)) & 0xffff;
    return 40 + (h % 60); // 40 – 99
}

const LEVEL_LABELS = ['Beginner', 'Developing', 'Proficient', 'Advanced', 'Expert'];
function levelLabel(pct: number) {
    if (pct >= 90) return LEVEL_LABELS[4];
    if (pct >= 75) return LEVEL_LABELS[3];
    if (pct >= 55) return LEVEL_LABELS[2];
    if (pct >= 40) return LEVEL_LABELS[1];
    return LEVEL_LABELS[0];
}

function opacityFor(pct: number) {
    return 0.06 + (pct / 100) * 0.3; // 0.06 → 0.36
}

export default function SkillHeatmap({ skills, gapSkills }: SkillHeatmapProps) {
    return (
        <Box>
            {/* Legend */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', background: 'rgba(255,255,255,0.32)' }} />
                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>You have</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '3px', background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.12)' }} />
                    <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>Gap</Typography>
                </Box>
            </Box>

            {/* Skill cells */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.9 }}>
                {skills.map((skill) => {
                    const pct = profLevel(skill);
                    return (
                        <Tooltip
                            key={skill}
                            title={`${skill} — ${levelLabel(pct)} (${pct}%)`}
                            placement="top"
                            arrow
                        >
                            <Box sx={{
                                px: 1.5, py: 0.65,
                                borderRadius: '8px',
                                fontSize: '0.77rem', fontWeight: 600,
                                background: `rgba(255,255,255,${opacityFor(pct)})`,
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff',
                                cursor: 'default',
                                transition: 'all 0.18s',
                                position: 'relative',
                                '&:hover': { transform: 'translateY(-2px)', filter: 'brightness(1.25)' },
                            }}>
                                {skill}
                                {/* Tiny proficiency dot */}
                                <Box sx={{
                                    position: 'absolute', top: 4, right: 4,
                                    width: 4, height: 4, borderRadius: '50%',
                                    background: `rgba(255,255,255,${pct / 100})`,
                                }} />
                            </Box>
                        </Tooltip>
                    );
                })}
                {gapSkills.map((skill) => (
                    <Tooltip
                        key={skill}
                        title={`${skill} — Not in resume (Gap)`}
                        placement="top"
                        arrow
                    >
                        <Box sx={{
                            px: 1.5, py: 0.65,
                            borderRadius: '8px',
                            fontSize: '0.77rem', fontWeight: 600,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px dashed rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.25)',
                            cursor: 'default',
                            transition: 'all 0.18s',
                            '&:hover': { transform: 'translateY(-2px)', background: 'rgba(255,255,255,0.05)' },
                        }}>
                            {skill}
                        </Box>
                    </Tooltip>
                ))}
            </Box>
        </Box>
    );
}
