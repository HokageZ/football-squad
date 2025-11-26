'use client';

import { motion } from 'framer-motion';
import { STAT_COLORS, StatKey } from '@/lib/types';

interface StatBarProps {
  statKey: StatKey;
  label: string;
  value: number;
  maxValue?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StatBar({
  statKey,
  label,
  value,
  maxValue = 10,
  showLabel = true,
  size = 'md',
}: StatBarProps) {
  const percentage = (value / maxValue) * 100;
  const color = STAT_COLORS[statKey];

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className={`flex justify-between mb-1 ${textSizes[size]}`}>
          <span className="font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          <span className="font-bold" style={{ color }}>
            {value}
          </span>
        </div>
      )}
      <div
        className={`w-full bg-secondary rounded-full overflow-hidden ${heights[size]}`}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
