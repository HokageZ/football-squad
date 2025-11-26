'use client';

import { motion } from 'framer-motion';
import { MoreVertical, Edit, Trash2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Player, STAT_KEYS, STAT_LABELS, POSITION_COLORS } from '@/lib/types';
import { calculateOverall } from '@/lib/team-balancer';
import { StatRadar } from './StatRadar';

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
  const overall = calculateOverall(player.stats);

  const getCardStyle = (rating: number) => {
    if (player.isUnknown) return 'from-zinc-900 to-black border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]';
    if (rating >= 90) return 'from-yellow-500/20 to-yellow-900/5 border-yellow-500/50 shadow-[0_0_20px_-5px_rgba(234,179,8,0.3)]';
    if (rating >= 80) return 'from-emerald-500/20 to-emerald-900/5 border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]';
    if (rating >= 70) return 'from-blue-500/20 to-blue-900/5 border-blue-500/50 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]';
    return 'from-slate-500/20 to-slate-900/5 border-slate-500/50';
  };

  const getOverallColor = (rating: number) => {
    if (player.isUnknown) return 'text-white/50';
    if (rating >= 90) return 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]';
    if (rating >= 80) return 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    if (rating >= 70) return 'text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]';
    return 'text-slate-400';
  };

  if (compact) {
    return (
      <Card className={`p-3 glass border-l-4 transition-all hover:scale-[1.02] cursor-pointer ${getCardStyle(overall).split(' ')[2]} border-l-${player.isUnknown ? 'white/20' : getOverallColor(overall).split(' ')[0]}`}>
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
                    <span>PAC <span className="text-foreground font-mono">{player.stats.pace}</span></span>
                    <span>SHO <span className="text-foreground font-mono">{player.stats.shooting}</span></span>
                    <span>PAS <span className="text-foreground font-mono">{player.stats.passing}</span></span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={`text-2xl font-black italic ${getOverallColor(overall)}`}>
            {player.isUnknown ? '??' : overall}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="h-full"
    >
      <div className={`
        relative h-full overflow-hidden rounded-xl border bg-gradient-to-br backdrop-blur-xl
        transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1
        ${getCardStyle(overall)}
      `}>
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-5 mix-blend-overlay" />

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
              <div className={`absolute inset-0 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${player.isUnknown ? 'bg-white/10' : 'bg-primary/20'}`} />
              <Avatar className="h-20 w-20 border-2 border-white/10 shadow-2xl">
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
                <DropdownMenuContent align="end" className="bg-black/90 border-white/10 backdrop-blur-xl">
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
            {player.position && (
              <span 
                className="inline-block mt-2 text-xs font-bold px-2 py-0.5 rounded"
                style={{ 
                  color: POSITION_COLORS[player.position],
                  backgroundColor: `${POSITION_COLORS[player.position]}20`
                }}
              >
                {player.position}
              </span>
            )}
            <div className={`h-1 w-12 mx-auto mt-2 opacity-50 ${player.isUnknown ? 'bg-white/20' : 'bg-gradient-to-r from-transparent via-primary to-transparent'}`} />
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
                <StatRadar stats={player.stats} height={140} />
              )}
            </div>

            {/* Numeric Stats Grid */}
            <div className="col-span-2 grid grid-cols-3 gap-x-2 gap-y-3 px-2">
              {STAT_KEYS.map((key) => (
                <div key={key} className="flex items-end justify-between border-b border-white/5 pb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {STAT_LABELS[key]}
                  </span>
                  <span className={`font-mono font-bold text-sm ${
                    player.isUnknown ? 'text-muted-foreground' :
                    player.stats[key] >= 80 ? 'text-primary' : 
                    player.stats[key] >= 60 ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    {player.isUnknown ? '?' : player.stats[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

