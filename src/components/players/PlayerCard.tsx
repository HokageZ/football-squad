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
import { Player, STAT_KEYS, STAT_LABELS } from '@/lib/types';
import { calculateOverall } from '@/lib/team-balancer';
import { StatBar } from './StatBar';

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

  const getOverallColor = (rating: number) => {
    if (rating >= 8) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    if (rating >= 4) return 'text-orange-500';
    return 'text-red-500';
  };

  if (compact) {
    return (
      <Card className="p-3 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={player.image} alt={player.name} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {player.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{player.name}</p>
            <div className="flex gap-1 mt-1">
              {STAT_KEYS.slice(0, 3).map((key) => (
                <Badge
                  key={key}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {STAT_LABELS[key]} {player.stats[key]}
                </Badge>
              ))}
            </div>
          </div>
          <Badge
            variant="outline"
            className={`text-lg font-bold ${getOverallColor(overall)}`}
          >
            {overall}
          </Badge>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className="overflow-hidden bg-gradient-to-br from-card to-card/80 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 border-2 border-primary/30 ring-2 ring-primary/10 ring-offset-2 ring-offset-background">
                <AvatarImage src={player.image} alt={player.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-lg font-bold">
                  {player.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-lg">{player.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">Overall</span>
                  <span
                    className={`text-xl font-black ${getOverallColor(overall)}`}
                  >
                    {overall}
                  </span>
                </div>
              </div>
            </div>

            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-md hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-2">
            {STAT_KEYS.map((key) => (
              <StatBar
                key={key}
                statKey={key}
                label={STAT_LABELS[key]}
                value={player.stats[key]}
                size="sm"
              />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
