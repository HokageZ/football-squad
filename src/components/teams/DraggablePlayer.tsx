'use client';

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Zap, Target, Sparkles, Shield, Dumbbell, ArrowRight, Ban } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Player, POSITION_COLORS, STAT_LABELS, STAT_COLORS, STAT_KEYS } from '@/lib/types';
import { calculateOverall } from '@/lib/team-balancer';

interface DraggablePlayerProps {
  player: Player;
  teamColor?: string;
  isCaptain?: boolean;
  onMakeCaptain?: () => void;
  onBench?: () => void;
}

export const DraggablePlayer = memo(function DraggablePlayer({ player, teamColor, isCaptain, onMakeCaptain, onBench }: DraggablePlayerProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none' as const,
    willChange: isDragging ? 'transform' as const : undefined,
  };

  const overall = calculateOverall(player.stats);

  // Get player's top stats and strengths
  const getPlayerStrengths = () => {
    if (player.isUnknown) return [];
    
    const stats = player.stats;
    const strengths: { label: string; value: number; icon: string }[] = [];
    
    // Find top 2 stats
    const sortedStats = STAT_KEYS
      .map(key => ({ key, value: stats[key] }))
      .sort((a, b) => b.value - a.value);
    
    const topStats = sortedStats.slice(0, 2);
    
    topStats.forEach(({ key, value }) => {
      if (value >= 70) {
        const labels: Record<string, string> = {
          pace: '⚡ Speed Demon',
          shooting: '🎯 Sharpshooter',
          dribbling: '✨ Skillful',
          passing: '🎯 Playmaker',
          defending: '🛡️ Solid Defender',
          physical: '💪 Tank',
        };
        strengths.push({ label: labels[key] || key, value, icon: key });
      }
    });
    
    return strengths;
  };

  const getSuggestedRole = () => {
    if (player.isUnknown) return 'Unknown potential';
    if (player.position) return null; // Already has a position
    
    const { pace, shooting, dribbling, passing, defending, physical } = player.stats;
    
    if (defending >= 75 && physical >= 70) return 'Natural Defender';
    if (pace >= 80 && shooting >= 75) return 'Goal Threat';
    if (passing >= 80 && dribbling >= 75) return 'Creative Midfielder';
    if (pace >= 85) return 'Winger Material';
    if (physical >= 80 && defending >= 70) return 'Defensive Midfielder';
    if (shooting >= 80) return 'Striker Instinct';
    
    return null;
  };

  const strengths = getPlayerStrengths();
  const suggestedRole = getSuggestedRole();

  const getOverallColor = (rating: number) => {
    if (player.isUnknown) return 'text-muted-foreground border-white/10';
    if (rating >= 90) return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5';
    if (rating >= 80) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5';
    if (rating >= 70) return 'text-blue-500 border-blue-500/30 bg-blue-500/5';
    return 'text-slate-400 border-slate-500/30 bg-slate-500/5';
  };

  const playerCard = (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-zinc-900/90 rounded-lg border touch-none
        ${isDragging ? 'opacity-50 shadow-xl z-50' : 'shadow-sm active:scale-[0.97] active:bg-zinc-800/90'}
        ${teamColor ? 'border-l-2 sm:border-l-4' : 'border-white/10 hover:border-white/20'}
        transition-[border-color,background-color] duration-150 cursor-grab active:cursor-grabbing group
      `}
      {...attributes}
      {...listeners}
    >
      <div className="text-muted-foreground/30 group-hover:text-muted-foreground/50 transition-colors hidden sm:block">
        <GripVertical className="h-4 w-4" />
      </div>

      <Avatar className="h-7 w-7 sm:h-9 sm:w-9 border border-white/10">
        <AvatarImage src={player.image} alt={player.name} />
        <AvatarFallback className="bg-white/5 text-xs font-bold text-muted-foreground">
          {player.isUnknown ? '?' : player.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <p className="font-bold text-xs sm:text-sm truncate text-foreground">{player.name}</p>
          {player.position && (
            <span 
              className="text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded shrink-0"
              style={{ 
                color: POSITION_COLORS[player.position],
                backgroundColor: `${POSITION_COLORS[player.position]}20`
              }}
            >
              {player.position}
            </span>
          )}
          {player.isUnknown && (
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-muted-foreground font-medium hidden sm:inline">
              Scouting
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Bench Button */}
        {onBench && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBench();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amber-500/20 rounded text-muted-foreground hover:text-amber-500 transition-colors"
            title="Move to bench"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Ban className="h-3 w-3" />
          </button>
        )}

        {/* Captain Button (Only visible on hover if in a team) */}
        {onMakeCaptain && !isCaptain && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag start
              onMakeCaptain();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-yellow-500 transition-colors"
            title="Make Captain"
            onPointerDown={(e) => e.stopPropagation()} // Important for dnd-kit
          >
            <div className="h-3 w-3 border-2 border-current rounded-sm font-bold text-[8px] flex items-center justify-center">C</div>
          </button>
        )}

        {/* Captain Badge - inline so it's never clipped by overflow */}
        {isCaptain && (
          <span className="bg-yellow-500 text-black font-black text-[10px] px-1.5 py-0.5 rounded shadow-lg border border-yellow-400 animate-in zoom-in shrink-0">
            C
          </span>
        )}

        <Badge
          variant="outline"
          className={`font-mono font-bold text-[10px] sm:text-xs min-w-[1.75rem] sm:min-w-[2rem] justify-center ${getOverallColor(overall)}`}
        >
          {player.isUnknown ? '?' : overall}
        </Badge>
      </div>
    </div>
  );

  // Don't show hover card while dragging
  if (isDragging) {
    return playerCard;
  }

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        {playerCard}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-64 p-0 bg-zinc-950/95 border-white/10"
        side="bottom"
        align="start"
        sideOffset={4}
      >
        {/* Header */}
        <div className="p-3 border-b border-white/10 flex items-center gap-3">
          <Avatar className="h-12 w-12 border-2 border-white/10">
            <AvatarImage src={player.image} alt={player.name} />
            <AvatarFallback className="bg-white/5 text-lg font-bold">
              {player.isUnknown ? '?' : player.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-black text-sm">{player.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              {player.position && (
                <span 
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ 
                    color: POSITION_COLORS[player.position],
                    backgroundColor: `${POSITION_COLORS[player.position]}20`
                  }}
                >
                  {player.position}
                </span>
              )}
              <span className={`text-lg font-black ${getOverallColor(overall).split(' ')[0]}`}>
                {player.isUnknown ? '??' : overall}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {!player.isUnknown && (
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {STAT_KEYS.map((key) => (
                <div key={key} className="text-center">
                  <div 
                    className="text-lg font-black"
                    style={{ color: player.stats[key] >= 75 ? STAT_COLORS[key] : undefined }}
                  >
                    {player.stats[key]}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-bold uppercase">
                    {STAT_LABELS[key]}
                  </div>
                </div>
              ))}
            </div>

            {/* Strengths */}
            {strengths.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Strengths</p>
                <div className="flex flex-wrap gap-1.5">
                  {strengths.map((s, i) => (
                    <span 
                      key={i}
                      className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/10 text-primary"
                    >
                      {s.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Role */}
            {suggestedRole && (
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Suggested: <span className="text-primary font-bold">{suggestedRole}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Unknown player message */}
        {player.isUnknown && (
          <div className="p-4 text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Stats hidden - Scouting in progress</p>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
});
