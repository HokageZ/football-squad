'use client';

import { Slider } from '@/components/ui/slider';
import { STAT_COLORS, StatKey } from '@/lib/types';

interface StatSliderProps {
  statKey: StatKey;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function StatSlider({
  statKey,
  label,
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
}: StatSliderProps) {
  const color = STAT_COLORS[statKey];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
        <span
          className="text-lg font-bold tabular-nums"
          style={{ color }}
        >
          {value}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="cursor-pointer"
        style={
          {
            '--slider-color': color,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
