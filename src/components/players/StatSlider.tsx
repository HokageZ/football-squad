'use client';

import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { STAT_COLORS, StatKey } from '@/lib/types';

interface StatSliderProps {
  statKey: StatKey;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export function StatSlider({
  statKey,
  label,
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  description,
}: StatSliderProps) {
  const color = STAT_COLORS[statKey];

  const getValueColor = (v: number) => {
    if (v >= 80) return 'text-emerald-400';
    if (v >= 60) return 'text-yellow-400';
    if (v >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </label>
          {description && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-help">
                  <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-zinc-900 border-white/10 text-white backdrop-blur-xl max-w-[200px] z-50">
                <p className="text-[11px] font-medium">{description}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <span
          className={`text-lg font-bold tabular-nums ${getValueColor(value)}`}
          style={{ color }}
        >
          {value}
        </span>
      </div>
      <div className="relative">
        {/* Color zone background */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none h-[6px] top-[calc(50%-3px)] rounded-full overflow-hidden opacity-20">
          <div className="h-full w-[40%] bg-gradient-to-r from-red-500 to-orange-500" />
          <div className="h-full w-[20%] bg-gradient-to-r from-orange-500 to-yellow-500" />
          <div className="h-full w-[20%] bg-gradient-to-r from-yellow-500 to-emerald-500" />
          <div className="h-full w-[20%] bg-gradient-to-r from-emerald-500 to-primary" />
        </div>
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={step}
          className="cursor-pointer relative z-10"
          style={
            {
              '--slider-color': color,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
