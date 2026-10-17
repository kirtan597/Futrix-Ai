import React from 'react';
import KeycapOrb, { type Keycap, type KeycapFinish } from '@/components/ui/keycap-orb';

interface ATSSphereProps {
  score: number;
  matchPercent?: number;
  isSevereMismatch?: boolean;
}

export default function ATSSphere({
  score,
  isSevereMismatch = false,
}: ATSSphereProps) {
  // All keys of the 3D Orb display the ATS score number across varied finishes
  const atsKeys: Keycap[] = React.useMemo(() => {
    const finishes: KeycapFinish[] = [
      "cobalt", "ink", "ash", "glass", "lime", 
      "ink", "ash", "glass", "cobalt", "ink"
    ];
    return Array.from({ length: 32 }, (_, i) => ({
      label: `${score}`,
      finish: isSevereMismatch 
        ? (i % 2 === 0 ? "lime" : "ink") 
        : finishes[i % finishes.length],
      hotkey: `${score}`.charAt(i % `${score}`.length),
    }));
  }, [score, isSevereMismatch]);

  const glowColor = isSevereMismatch ? "#f43f5e" : score >= 80 ? "#3b82f6" : "#6366f1";

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.012) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.09)',
        borderRadius: '18px',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        cursor: 'grab',
      }}
    >
      {/* 3D WebGL Keycap Orb with ATS score on every keycap and pure minimalist presentation */}
      <KeycapOrb
        keys={atsKeys}
        rings={9}
        scale={0.88}
        background="#06070a"
        glow={glowColor}
        speed={0.7}
        autoRotate={true}
        reflection={false}
        ripple={true}
        height="300px"
        palette={{
          ink: { cap: '#15171e', legend: '#f8fafc' },
          ash: { cap: '#2a2d3d', legend: '#cbd5e1' },
          glass: { cap: '#60a5fa', legend: '#93c5fd' },
          cobalt: { cap: '#2563eb', legend: '#ffffff' },
          lime: { cap: '#f59e0b', legend: '#000000' },
        }}
        aria-label={`Interactive 3D ATS score orb displaying score of ${score}`}
      />
    </div>
  );
}
