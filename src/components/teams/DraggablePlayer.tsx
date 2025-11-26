'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Player, POSITION_COLORS } from '@/lib/types';
import { calculateOverall } from '@/lib/team-balancer';

interface DraggablePlayerProps {
  player: Player;
  teamColor?: string;
  isCaptain?: boolean;
  onMakeCaptain?: () => void;
}

export function DraggablePlayer({ player, teamColor, isCaptain, onMakeCaptain }: DraggablePlayerProps) {
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
  };

  const overall = calculateOverall(player.stats);

  const getOverallColor = (rating: number) => {
    if (player.isUnknown) return 'text-muted-foreground border-white/10';
    if (rating >= 90) return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5';
    if (rating >= 80) return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5';
    if (rating >= 70) return 'text-blue-500 border-blue-500/30 bg-blue-500/5';
    return 'text-slate-400 border-slate-500/30 bg-slate-500/5';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-black/40 backdrop-blur-md rounded-lg border
        ${isDragging ? 'opacity-50 shadow-xl scale-105 z-50' : 'shadow-sm'}
        ${teamColor ? 'border-l-2 sm:border-l-4' : 'border-white/10 hover:border-white/20'}
        transition-all duration-200 cursor-grab active:cursor-grabbing group
      `}
      {...attributes}
      {...listeners}
    >
      {/* Captain Badge */}
      {isCaptain && (
        <div className="absolute -top-2 -right-2 z-10 bg-yellow-500 text-black font-black text-[10px] px-1.5 py-0.5 rounded shadow-lg border border-yellow-400 animate-in zoom-in">
          C
        </div>
      )}

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
          <p className="font-bold text-xs sm:text-sm truncate text-gray-200">{player.name}</p>
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

      <div className="flex items-center gap-2">
        {/* Captain Button (Only visible on hover if in a team) */}
        {onMakeCaptain && !isCaptain && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag start
              onMakeCaptain();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-yellow-500 transition-all"
            title="Make Captain"
            onPointerDown={(e) => e.stopPropagation()} // Important for dnd-kit
          >
            <div className="h-3 w-3 border-2 border-current rounded-sm font-bold text-[8px] flex items-center justify-center">C</div>
          </button>
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
}
