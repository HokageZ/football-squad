'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Team, POSITION_COLORS, PlayerPosition } from '@/lib/types';
import { calculateTeamOverall, getTeamPositionBreakdown } from '@/lib/team-balancer';
import { DraggablePlayer } from './DraggablePlayer';

interface PitchViewProps {
  team: Team;
  side: 'left' | 'right';
  onMakeCaptain: (playerId: string) => void;
}

export function PitchView({ team, side, onMakeCaptain }: PitchViewProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
  });

  const overall = calculateTeamOverall(team.players);
  const positionBreakdown = getTeamPositionBreakdown(team.players);

  return (
    <div
      ref={setNodeRef}
      className={`
        relative flex flex-col h-full min-h-[200px] sm:min-h-[250px] rounded-lg sm:rounded-xl overflow-hidden border-2 sm:border-4 transition-colors duration-300
        ${isOver ? 'border-primary bg-primary/10' : 'border-white/10 bg-black/20'}
      `}
      style={{
        borderColor: isOver ? 'var(--primary)' : team.color,
      }}
    >
      {/* Pitch Patterns (Grass Lines) - Hidden on mobile for cleaner look */}
      <div className="absolute inset-0 opacity-10 pointer-events-none hidden sm:block">
        <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_49px,#ffffff_50px)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_49px,#ffffff_50px)] opacity-30" />
        {/* Center Circle (Half) */}
        <div className={`
          absolute top-1/2 w-24 md:w-32 h-24 md:h-32 border-2 md:border-4 border-white/20 rounded-full -translate-y-1/2
          ${side === 'left' ? '-right-12 md:-right-16' : '-left-12 md:-left-16'}
        `} />
        {/* Penalty Box */}
        <div className={`
          absolute top-1/2 w-24 md:w-32 h-48 md:h-64 border-2 md:border-4 border-white/20 -translate-y-1/2
          ${side === 'left' ? 'left-0 border-l-0' : 'right-0 border-r-0'}
        `} />
      </div>

      {/* Team Header */}
      <div className="relative z-10 p-2.5 sm:p-4 bg-black/40 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-base sm:text-xl uppercase tracking-tight" style={{ color: team.color }}>
              {team.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              {(['GK', 'DEF', 'MID', 'ATT'] as PlayerPosition[]).map(pos => (
                positionBreakdown[pos] > 0 && (
                  <span
                    key={pos}
                    className="text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded"
                    style={{ 
                      color: POSITION_COLORS[pos],
                      backgroundColor: `${POSITION_COLORS[pos]}20`
                    }}
                  >
                    {positionBreakdown[pos]}{pos}
                  </span>
                )
              ))}
              {positionBreakdown.NONE > 0 && (
                <span className="text-[9px] sm:text-[10px] font-bold px-1 py-0.5 rounded text-muted-foreground bg-white/5">
                  {positionBreakdown.NONE}?
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xl sm:text-2xl font-black">{overall}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold">OVR</span>
          </div>
        </div>
      </div>

      {/* Players Container */}
      <div className="relative flex-1 p-2 sm:p-4 overflow-y-auto">
        <SortableContext
          items={team.players.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5 sm:space-y-2">
            {team.players.length === 0 ? (
              <div className="h-full min-h-[80px] flex items-center justify-center opacity-30">
                <p className="text-xs sm:text-lg font-black uppercase tracking-widest text-white text-center px-2">
                  Drag Players Here
                </p>
              </div>
            ) : (
              team.players.map((player) => (
                <DraggablePlayer
                  key={player.id}
                  player={player}
                  teamColor={team.color}
                  isCaptain={team.captainId === player.id}
                  onMakeCaptain={() => onMakeCaptain(player.id)}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
