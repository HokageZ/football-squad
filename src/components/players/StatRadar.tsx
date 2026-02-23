'use client';

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import { PlayerStats, PlayerPosition, STAT_KEYS, OUTFIELD_STAT_KEYS, STAT_LABELS, STAT_COLORS } from '@/lib/types';

interface StatRadarProps {
  stats: PlayerStats;
  height?: number;
  showLabels?: boolean;
  position?: PlayerPosition;
}

export function StatRadar({ stats, height = 200, showLabels = true, position }: StatRadarProps) {
  const statKeys = position === 'GK' ? STAT_KEYS : OUTFIELD_STAT_KEYS;
  // Add a max-value reference point so the radar has a fixed outer boundary
  const data = statKeys.map((key) => ({
    subject: STAT_LABELS[key],
    A: stats[key],
    max: 99,
    fullMark: 99,
    color: STAT_COLORS[key],
  }));

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="currentColor" strokeOpacity={0.15} gridType="polygon" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 'bold', opacity: 0.7 }}
            axisLine={false}
            tickLine={false}
          />
          <Radar
            name="Max"
            dataKey="max"
            stroke="currentColor"
            strokeOpacity={0.08}
            strokeWidth={1}
            fill="transparent"
            fillOpacity={0}
          />
          <Radar
            name="Player"
            dataKey="A"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="var(--primary)"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
