'use client';

import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Team, POSITION_COLORS, PlayerPosition } from '@/lib/types';
import { calculateTeamOverall, calculateTeamTotalOverall, getTeamPositionBreakdown } from '@/lib/team-balancer';
import { DraggablePlayer } from './DraggablePlayer';
import { Shield, Crown, Pencil } from 'lucide-react';

interface PitchViewProps {
  team: Team;
  side: 'left' | 'right';
  onMakeCaptain: (playerId: string) => void;
  onBenchPlayer?: (playerId: string) => void;
  onRenameTeam?: (newName: string) => void;
}

export function PitchView({ team, side, onMakeCaptain, onBenchPlayer, onRenameTeam }: PitchViewProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: team.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveName = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== team.name && onRenameTeam) {
      onRenameTeam(trimmed);
    } else {
      setEditName(team.name);
    }
    setIsEditing(false);
  };

  const overall = calculateTeamOverall(team.players);
  const totalRating = calculateTeamTotalOverall(team.players);
  const positionBreakdown = getTeamPositionBreakdown(team.players);

  return (
    <div
      ref={setNodeRef}
      className={`
        relative flex flex-col h-full min-h-[500px] rounded-3xl overflow-hidden transition-all duration-500
        ${isOver ? 'bg-primary/5 shadow-[inset_0_0_50px_rgba(var(--primary),0.2)]' : 'bg-black/40'}
      `}
    >
      {/* Holographic Border */}
      <div className={`absolute inset-0 border-2 rounded-3xl pointer-events-none z-20 ${isOver ? 'border-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]' : 'border-white/10'}`} />

      {/* Pitch Grid & Lines */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {/* Base Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Tactical Lines */}
        <div className={`absolute top-0 bottom-0 w-px bg-white/30 ${side === 'left' ? 'right-0' : 'left-0'}`} />
        <div className={`absolute top-1/2 w-32 h-32 border-2 border-white/30 rounded-full -translate-y-1/2 ${side === 'left' ? '-right-16' : '-left-16'}`} />

        {/* Penalty Area */}
        <div className={`absolute top-1/2 w-40 h-80 border-2 border-white/30 -translate-y-1/2 ${side === 'left' ? 'left-0 border-l-0 rounded-r-2xl' : 'right-0 border-r-0 rounded-l-2xl'}`} />

        {/* Goal Area */}
        <div className={`absolute top-1/2 w-16 h-32 border-2 border-white/30 -translate-y-1/2 ${side === 'left' ? 'left-0 border-l-0 rounded-r-xl' : 'right-0 border-r-0 rounded-l-xl'}`} />
      </div>

      {/* Team Header - Floating Glass Card */}
      <div className="relative z-10 p-6">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-4 group hover:bg-white/10 transition-colors">
          <div className={`absolute inset-0 bg-gradient-to-r opacity-10 transition-opacity group-hover:opacity-20`} style={{ backgroundImage: `linear-gradient(to right, ${team.color}, transparent)` }} />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${team.color}20`, color: team.color }}>
                <Shield className="h-5 w-5 fill-current" />
              </div>
              <div>
                {isEditing ? (
                  <input
                    ref={inputRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={handleSaveName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') {
                        setEditName(team.name);
                        setIsEditing(false);
                      }
                    }}
                    className="font-black text-lg uppercase tracking-tight leading-none bg-transparent border-b-2 outline-none px-0 py-0.5 w-full max-w-[180px]"
                    style={{ color: team.color, borderColor: team.color }}
                    maxLength={20}
                  />
                ) : (
                  <h3
                    className="font-black text-lg uppercase tracking-tight leading-none mb-1 cursor-pointer flex items-center gap-2"
                    style={{ color: team.color }}
                    onClick={() => {
                      if (onRenameTeam) {
                        setEditName(team.name);
                        setIsEditing(true);
                      }
                    }}
                    title="Click to rename"
                  >
                    {team.name}
                    {onRenameTeam && (
                      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    )}
                  </h3>
                )}
                <div className="flex gap-1 mt-1">
                  {(['GK', 'DEF', 'MID', 'ATT'] as PlayerPosition[]).map(pos => positionBreakdown[pos] > 0 && (
                    <span key={pos} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/5">
                      {positionBreakdown[pos]} {pos}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black italic leading-none" style={{ color: team.color }}>
                {overall}
              </div>
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">AVG</div>
              <div className="text-xs font-bold text-muted-foreground mt-0.5">Total: {totalRating}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="relative flex-1 px-4 pb-4 overflow-y-auto scrollbar-thin">
        <SortableContext
          items={team.players.map((p) => p.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2 min-h-[200px]">
            {team.players.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 py-12 border-2 border-dashed border-white/5 rounded-2xl">
                <Shield className="h-12 w-12 mb-2 opacity-50" />
                <p className="text-sm font-bold uppercase tracking-widest">Empty Formation</p>
              </div>
            ) : (
              team.players.map((player) => (
                <DraggablePlayer
                  key={player.id}
                  player={player}
                  teamColor={team.color}
                  isCaptain={team.captainId === player.id}
                  onMakeCaptain={() => onMakeCaptain(player.id)}
                  onBench={onBenchPlayer ? () => onBenchPlayer(player.id) : undefined}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
