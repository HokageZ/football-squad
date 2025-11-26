'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/lib/types';
import { calculateOverall } from '@/lib/team-balancer';

interface DraggablePlayerProps {
  player: Player;
  teamColor?: string;
}

export function DraggablePlayer({ player, teamColor }: DraggablePlayerProps) {
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
    if (rating >= 8) return 'text-green-500 border-green-500/30';
    if (rating >= 6) return 'text-yellow-500 border-yellow-500/30';
    if (rating >= 4) return 'text-orange-500 border-orange-500/30';
    return 'text-red-500 border-red-500/30';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 bg-card/80 backdrop-blur-sm rounded-lg border
        ${isDragging ? 'opacity-50 shadow-xl scale-105 z-50' : 'shadow-sm'}
        ${teamColor ? 'border-l-4' : 'border-border'}
        hover:bg-accent/50 transition-all duration-200 cursor-grab active:cursor-grabbing
      `}
      {...attributes}
      {...listeners}
    >
      <div className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
        <GripVertical className="h-5 w-5" />
      </div>

      <Avatar className="h-10 w-10 border-2 border-primary/20">
        <AvatarImage src={player.image} alt={player.name} />
        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
          {player.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{player.name}</p>
      </div>

      <Badge
        variant="outline"
        className={`font-bold text-base ${getOverallColor(overall)}`}
      >
        {overall}
      </Badge>
    </div>
  );
}
