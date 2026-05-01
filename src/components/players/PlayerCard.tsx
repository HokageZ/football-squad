'use client';

import { MoreVertical, Edit, Trash2, User, Zap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Player, STAT_KEYS, OUTFIELD_STAT_KEYS, STAT_LABELS, POSITION_COLORS } from '@/lib/types';
import { calculateOverall, calculatePositionOverall, getPlayerOverall } from '@/lib/team-balancer';
import { StatRadar } from './StatRadar';

type Archetype = { label: string; color: string };

function getPlayerArchetypes(player: Player): Archetype[] {
  const s = player.stats;
  if (player.isUnknown) return [{ label: 'Unknown', color: 'text-muted-foreground' }];

  const out: Archetype[] = [];
  const seen = new Set<string>();
  const push = (a: Archetype) => {
    if (seen.has(a.label)) return;
    seen.add(a.label);
    out.push(a);
  };

  // Position-specific archetypes — push all that match
  if (player.position === 'GK') {
    if (s.goalkeeping >= 85 && s.pace >= 70) push({ label: 'Sweeper Keeper', color: 'text-cyan-400' });
    if (s.goalkeeping >= 85 && s.physical >= 75) push({ label: 'Commander', color: 'text-amber-400' });
    if (s.goalkeeping >= 80 && s.passing >= 70) push({ label: 'Distributor', color: 'text-blue-400' });
    if (s.goalkeeping >= 75) push({ label: 'Shot Stopper', color: 'text-yellow-400' });
    if (s.goalkeeping >= 60 && out.length === 0) push({ label: 'Keeper', color: 'text-muted-foreground' });
  }

  if (player.position === 'DEF') {
    if (s.defending >= 80 && s.pace >= 75) push({ label: 'Sweeper', color: 'text-cyan-400' });
    if (s.defending >= 80 && s.physical >= 80) push({ label: 'Stopper', color: 'text-orange-400' });
    if (s.defending >= 75 && s.passing >= 75) push({ label: 'Ball Player', color: 'text-blue-400' });
    if (s.defending >= 80 && s.dribbling >= 70) push({ label: 'Modern Defender', color: 'text-emerald-400' });
    if (s.defending >= 75 && out.length === 0) push({ label: 'Rock', color: 'text-indigo-400' });
  }

  if (player.position === 'MID') {
    if (s.passing >= 80 && s.defending >= 70) push({ label: 'Deep Playmaker', color: 'text-purple-400' });
    if (s.passing >= 80 && s.dribbling >= 75) push({ label: 'Maestro', color: 'text-yellow-400' });
    if (s.physical >= 75 && s.defending >= 70 && s.pace >= 70) push({ label: 'Box-to-Box', color: 'text-orange-400' });
    if (s.shooting >= 75 && s.dribbling >= 75) push({ label: 'Attacking Mid', color: 'text-red-400' });
    if (s.pace >= 80 && s.dribbling >= 75) push({ label: 'Engine', color: 'text-emerald-400' });
  }

  if (player.position === 'ATT') {
    if (s.shooting >= 85 && s.pace >= 80) push({ label: 'Poacher', color: 'text-red-400' });
    if (s.physical >= 80 && s.shooting >= 75) push({ label: 'Target Man', color: 'text-orange-400' });
    if (s.dribbling >= 80 && s.passing >= 75) push({ label: 'False 9', color: 'text-purple-400' });
    if (s.pace >= 85 && s.dribbling >= 80) push({ label: 'Winger', color: 'text-emerald-400' });
    if (s.shooting >= 80) push({ label: 'Fox in the Box', color: 'text-yellow-400' });
    if (s.pace >= 85) push({ label: 'Speedster', color: 'text-cyan-400' });
  }

  // Generic stat-based archetypes (always evaluated, deduped above)
  if (s.pace >= 80 && s.shooting >= 75 && s.dribbling >= 75) push({ label: 'Speedster', color: 'text-cyan-400' });
  if (s.shooting >= 80 && s.passing >= 70) push({ label: 'Playmaker', color: 'text-purple-400' });
  if (s.defending >= 80 && s.physical >= 75) push({ label: 'Wall', color: 'text-blue-400' });
  if (s.pace >= 80 && s.dribbling >= 80) push({ label: 'Winger', color: 'text-emerald-400' });
  if (s.shooting >= 85) push({ label: 'Sniper', color: 'text-red-400' });
  if (s.passing >= 80) push({ label: 'Maestro', color: 'text-yellow-400' });
  if (s.physical >= 80) push({ label: 'Tank', color: 'text-orange-400' });
  if (s.defending >= 80) push({ label: 'Anchor', color: 'text-indigo-400' });
  if (s.dribbling >= 80) push({ label: 'Technician', color: 'text-pink-400' });

  if (out.length === 0) {
    const overall = calculateOverall(s);
    if (overall >= 80) push({ label: 'Complete', color: 'text-primary' });
    else if (overall >= 65) push({ label: 'Balanced', color: 'text-muted-foreground' });
    else push({ label: 'Prospect', color: 'text-muted-foreground' });
  }

  return out;
}

function getStatColor(value: number): string {
  if (value >= 85) return 'text-primary';
  if (value >= 75) return 'text-emerald-400';
  if (value >= 60) return 'text-yellow-400';
  if (value >= 40) return 'text-orange-400';
  return 'text-red-400';
}

interface PlayerCardProps {
  player: Player;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}

export function PlayerCard({
  player,
  onEdit,
  onDelete,
  compact = false,
}: PlayerCardProps) {
  const overall = getPlayerOverall(player);
  const archetypes = getPlayerArchetypes(player);
  const primaryArchetype = archetypes[0];
  const userTags = player.tags ?? [];
  const posOverall = player.position ? calculatePositionOverall(player.stats, player.position) : null;
  const baseOverall = calculateOverall(player.stats);

  const getCardStyle = (rating: number) => {
    if (player.isUnknown) return 'from-zinc-900 to-black border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]';
    if (rating >= 90) return 'from-yellow-500/20 to-yellow-900/5 border-yellow-500/50 shadow-[0_0_20px_-5px_rgba(234,179,8,0.3)]';
    if (rating >= 80) return 'from-emerald-500/20 to-emerald-900/5 border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]';
    if (rating >= 70) return 'from-blue-500/20 to-blue-900/5 border-blue-500/50 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]';
    return 'from-slate-500/20 to-slate-900/5 border-slate-500/50';
  };

  const getOverallColor = (rating: number) => {
    if (player.isUnknown) return 'text-white/50';
    if (rating >= 90) return 'text-yellow-500';
    if (rating >= 80) return 'text-emerald-500';
    if (rating >= 70) return 'text-blue-500';
    return 'text-slate-400';
  };

  if (compact) {
    return (
      <Card className={`p-3 glass border-l-4 transition-colors duration-200 cursor-pointer ${getCardStyle(overall).split(' ')[2]} border-l-${player.isUnknown ? 'white/20' : getOverallColor(overall).split(' ')[0]}`}>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-white/10">
            <AvatarImage src={player.image} alt={player.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {player.isUnknown ? '?' : player.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold truncate">{player.name}</p>
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
            </div>
            <div className="flex gap-2 mt-1">
              <div className="text-[10px] text-muted-foreground flex gap-2">
                {player.isUnknown ? (
                  <span className="italic">Scouting In Progress...</span>
                ) : (
                  <>
                    <span>PAC <span className={`font-mono ${getStatColor(player.stats.pace)}`}>{player.stats.pace}</span></span>
                    <span>SHO <span className={`font-mono ${getStatColor(player.stats.shooting)}`}>{player.stats.shooting}</span></span>
                    <span>PAS <span className={`font-mono ${getStatColor(player.stats.passing)}`}>{player.stats.passing}</span></span>
                    <span className={`ml-1 ${primaryArchetype.color}`}>{primaryArchetype.label}</span>
                  </>
                )}
              </div>
            </div>
            {userTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {userTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary"
                  >
                    {tag}
                  </span>
                ))}
                {userTags.length > 3 && (
                  <span className="text-[9px] font-bold text-muted-foreground/70">
                    +{userTags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={`text-2xl font-black italic ${getOverallColor(overall)}`}>
            {player.isUnknown ? '??' : overall}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="h-full">
      <div className={`
        relative h-full overflow-hidden rounded-xl border bg-gradient-to-br
        transition-colors duration-200 hover:border-white/30
        ${getCardStyle(overall)}
      `}>

        <div className="relative p-5">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col items-center">
              <span className={`text-4xl font-black italic tracking-tighter leading-none ${getOverallColor(overall)}`}>
                {player.isUnknown ? '??' : overall}
              </span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                OVR
              </span>
            </div>
            
            <div className="relative group">
              <Avatar className="h-20 w-20 border-2 border-white/10 shadow-xl">
                <AvatarImage src={player.image} alt={player.name} className="object-cover" />
                <AvatarFallback className="bg-black/40 text-2xl font-bold">
                  {player.isUnknown ? '?' : player.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-950/95 border-white/10">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit} className="focus:bg-white/10">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Player Name & Position */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-black uppercase tracking-tight truncate px-2">
              {player.name}
            </h3>
            <div className="flex items-center justify-center gap-2 mt-2">
              {player.position && (
                <span 
                  className="inline-block text-xs font-bold px-2 py-0.5 rounded"
                  style={{ 
                    color: POSITION_COLORS[player.position],
                    backgroundColor: `${POSITION_COLORS[player.position]}20`
                  }}
                >
                  {player.position}
                </span>
              )}
              {!player.isUnknown &&
                archetypes.slice(0, 3).map((a) => (
                  <span
                    key={a.label}
                    className={`text-[10px] font-bold ${a.color} bg-white/5 px-1.5 py-0.5 rounded`}
                  >
                    {a.label}
                  </span>
                ))}
              {archetypes.length > 3 && !player.isUnknown && (
                <span className="text-[10px] font-bold text-muted-foreground/70 px-1.5 py-0.5">
                  +{archetypes.length - 3}
                </span>
              )}
            </div>
            {/* Base overall (when different from position-weighted) */}
            {posOverall !== null && posOverall !== baseOverall && !player.isUnknown && (
              <div className="flex items-center justify-center gap-1 mt-1.5">
                <Zap className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-bold text-muted-foreground">Base OVR: {baseOverall}</span>
              </div>
            )}
            <div className={`h-1 w-12 mx-auto mt-2 opacity-50 ${player.isUnknown ? 'bg-white/20' : 'bg-gradient-to-r from-transparent via-primary to-transparent'}`} />

            {/* User-defined tags */}
            {userTags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 mt-2.5">
                {userTags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary"
                  >
                    {tag}
                  </span>
                ))}
                {userTags.length > 4 && (
                  <span className="text-[9px] font-bold text-muted-foreground/70 px-1">
                    +{userTags.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4">
            {/* Radar Chart */}
            <div className="col-span-2 h-[140px] -ml-4 flex items-center justify-center">
              {player.isUnknown ? (
                <div className="text-center text-muted-foreground opacity-50">
                  <User className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-xs uppercase font-bold tracking-widest">Stats Hidden</p>
                </div>
              ) : (
                <StatRadar stats={player.stats} height={140} position={player.position} />
              )}
            </div>

            {/* Numeric Stats Grid */}
            <div className="col-span-2 grid grid-cols-3 gap-x-2 gap-y-3 px-2">
              {(player.position === 'GK' ? STAT_KEYS : OUTFIELD_STAT_KEYS).map((key) => (
                <div key={key} className="flex items-end justify-between border-b border-white/5 pb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {STAT_LABELS[key]}
                  </span>
                  <span className={`font-mono font-bold text-sm ${
                    player.isUnknown ? 'text-muted-foreground' : getStatColor(player.stats[key])
                  }`}>
                    {player.isUnknown ? '?' : player.stats[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
